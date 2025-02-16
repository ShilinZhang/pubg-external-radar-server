vapp = new Vue({
    el: "#app",
    data: {
        followID: "", // 当前跟随的玩家ID
        followMe: 1,
        followRot: 0,
        showName: 1,
        showHp: 1,
        showFriend: 1,
        showAirdrop: 1,
        showVehicles: 1,
        showVehiclesName: 1,
        showBoat: 1,
        showBoatName: 1,
        showInformation: 0,
        iconSize: 8,
        dropDownBoxPlayers: [],  // 下拉框玩家列表
        scoreboardPlayers: [],  // 计分板玩家列表
        isLocked: false, // 锁定状态
        lockedPlayerID: null, // 锁定的玩家ID
        isMenuVisible: true, // 控制菜单显示的标志
        opacity: 1, // 标签透明度
        scale: 1, // 文字缩放比例
        // 射线设置
        enemyLine: { // 敌人
            length: 50, // 默认射线长度
            width: 3,   // 默认射线宽度
            color: '#ff0000' // 默认颜色红色
        },
        selfLine: { // 自己
            length: 50, // 默认射线长度
            width: 3,   // 默认射线宽度
            color: '#00ff00' // 默认颜色绿色
        },
        friendLine: { // 队友
            length: 50, // 默认射线长度
            width: 3,   // 默认射线宽度
            color: '#0000ff' // 默认颜色蓝色
        }
    },
    methods: {
        toggleMenu() {
            this.isMenuVisible = !this.isMenuVisible; // 切换菜单的显示状态
        },
        saveSettings() {
            // 保存当前的设置到localStorage
            localStorage.setItem('settings', JSON.stringify({
                followMe: this.followMe,
                followRot: this.followRot,
                showName: this.showName,
                showHp: this.showHp,
                showFriend: this.showFriend,
                showAirdrop: this.showAirdrop,
                showVehicles: this.showVehicles,
                showVehiclesName: this.showVehiclesName,
                showBoat: this.showBoat,
                showBoatName: this.showBoatName,
                showInformation: this.showInformation,
                iconSize: this.iconSize,
                opacity: this.opacity,
                scale: this.scale,
                enemyLine: this.enemyLine,
                selfLine: this.selfLine,
                friendLine: this.friendLine,
            }));
            alert('设置已保存');
        },
        loadSettings() {
            // 从localStorage加载设置
            const savedSettings = localStorage.getItem('settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.followMe = settings.followMe;
                this.followRot = settings.followRot;
                this.showName = settings.showName;
                this.showHp = settings.showHp;
                this.showFriend = settings.showFriend;
                this.showAirdrop = settings.showAirdrop;
                this.showVehicles = settings.showVehicles;
                this.showVehiclesName = settings.showVehiclesName;
                this.showBoat = settings.showBoat;
                this.showBoatName = settings.showBoatName;
                this.showInformation = settings.showInformation;
                this.iconSize = settings.iconSize;
                this.opacity = settings.opacity;
                this.scale = settings.scale;
                this.enemyLine = settings.enemyLine;
                this.selfLine = settings.selfLine;
                this.friendLine = settings.friendLine;
            }
        }
    },
    created() {
        // 页面加载时从localStorage加载设置
        this.loadSettings();
    }
});

const projection = ol.proj.get('EPSG:21781')

projection.setExtent([0, 0, 8192, 8192])

let mapLinks = {}; // 用来存储地图名称和对应链接的映射
getMapSources()

async function getMapSources() {
    let yDaoURL_A = "https://note.youdao.com/yws/api/personal/file/WEB";
    let yDaoURL_B = "?method=download&shareKey=";
    let yDaoURL_C = "";

    const url = 'MapPath.txt'; // 替换为实际的链接地址

    const response = await fetch(url); // 从URL获取数据
    if (!response.ok) {
        throw new Error('请求异常');
    }
    const text = await response.text(); // 获取文本内容
    const lines = text.split('\n'); // 将文本按行分割

    // 处理每一行数据并存储链接
    for (let i = 0; i < lines.length; i++) {
        let urlA = "";
        let urlB = "";
        let mapPath = "";
        let mapURL = "";

        // 分割单行数据
        const lineSplit = lines[i].split("|");

        if (lineSplit.length === 3) {
            // 存储WEB拼接
            yDaoURL_C = lineSplit[1];

            // 拼接链接
            urlA = yDaoURL_A + lineSplit[0];
            urlB = yDaoURL_B + yDaoURL_C;
            mapPath = lineSplit[2].trim();  // 使用 trim() 移除回车符和换行符
            mapURL = urlA + urlB;
        } else {
            urlA = yDaoURL_A + lineSplit[0];
            urlB = yDaoURL_B + yDaoURL_C;
            mapPath = lineSplit[1].trim();  // 使用 trim() 移除回车符和换行符
            mapURL = urlA + urlB;
        }

        // 将地图路径和对应链接存储到 mapLinks 对象中
        if (!mapLinks[mapPath]) {
            mapLinks[mapPath] = [];
        }
        mapLinks[mapPath] = mapURL;
    }

    return mapLinks;
}

// 读取地图资源
function getMapSource(mapPath) {
    return new ol.source.XYZ({
        'tileUrlFunction'(tileCord) {

            const [z, x, y] = tileCord;
            const tileUrl = mapPath + '/' + z + '/' + (-y - 1) + '_' + x;
            return mapLinks[tileUrl];
        },
        'wrapX': false,  // wrapX 是 false
        'minZoom': 1,    // 最小缩放级别
        'maxZoom': 4,    // 最大缩放级别
        'projection': projection  // 使用指定的投影
    });
}

// 定义地图
const view = new ol.View({
    center: [4096, 4096],
    zoom: 6,
    minZoom: 1,
    maxZoom: 6,
    projection: projection
});
const paod_map_data = new ol.Map({
    controls: ol.control.defaults({attribution: !1}).extend([new ol.control.ScaleLine({units: "metric"})]),
    loadTilesWhileAnimating: !0,
    loadTilesWhileInteracting: !0,
    view: view,
    target: "map"
});
const Tiger_Main = new ol.layer.Tile({
    source: getMapSource('Tiger_Main')
})
const Desert_Main = new ol.layer.Tile({
    source: getMapSource('Desert_Main')
})
const Kiki_Main = new ol.layer.Tile({
    source: getMapSource('Kiki_Main')
})
const Range_Main = new ol.layer.Tile({
    source: getMapSource('Range_Main')
})
const Baltic_Main = new ol.layer.Tile({
    source: getMapSource('Baltic_Main')
})
const Heaven_Main = new ol.layer.Tile({
    source: getMapSource('Heaven_Main')
})
const Savage_Main = new ol.layer.Tile({
    source: getMapSource('Savage_Main')
})
const DihorOtok_Main = new ol.layer.Tile({
    source: getMapSource('DihorOtok_Main')
})
const Chimera_Main = new ol.layer.Tile({
    source: getMapSource('Chimera_Main')
})
const Summerland_Main = new ol.layer.Tile({
    source: getMapSource('Summerland_Main')
})
const Neon_Main = new ol.layer.Tile({
    source: getMapSource('Neon_Main')
})

Tiger_Main.setZIndex(0);
Desert_Main.setZIndex(1);
Kiki_Main.setZIndex(2);
Range_Main.setZIndex(3);
Baltic_Main.setZIndex(4);
Heaven_Main.setZIndex(5);
Savage_Main.setZIndex(6);
DihorOtok_Main.setZIndex(7);
Chimera_Main.setZIndex(8);
Summerland_Main.setZIndex(9);
Neon_Main.setZIndex(10);

paod_map_data.addLayer(Tiger_Main);
paod_map_data.addLayer(Desert_Main);
paod_map_data.addLayer(Kiki_Main);
paod_map_data.addLayer(Range_Main);
paod_map_data.addLayer(Baltic_Main);
paod_map_data.addLayer(Heaven_Main);
paod_map_data.addLayer(Savage_Main);
paod_map_data.addLayer(DihorOtok_Main);
paod_map_data.addLayer(Chimera_Main);
paod_map_data.addLayer(Summerland_Main);
paod_map_data.addLayer(Neon_Main);

Tiger_Main.setVisible(0);
Desert_Main.setVisible(0);
Kiki_Main.setVisible(0);
Range_Main.setVisible(0);
Baltic_Main.setVisible(0);
Heaven_Main.setVisible(0);
Savage_Main.setVisible(0);
DihorOtok_Main.setVisible(0);
Chimera_Main.setVisible(0);
Summerland_Main.setVisible(0);
Neon_Main.setVisible(0);

// 定义其他玩家样式
const colors = Array.from({length: 1000}, (_, index) => {
    if (index >= 100) {
        return '#FFFFFF'; // 超过 100 设置为白色
    }
    const r = Math.floor(Math.random() * 256); // 0-255 之间的随机数
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
});

// 获取具有透明度的颜色
function getColorWithTransparency(hexColor, opacity) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const playerSource = new ol.source.Vector({
    wrapX: !1
});
const playerLayer = new ol.layer.Vector({
    source: playerSource
});
playerLayer.setZIndex(20);
paod_map_data.addLayer(playerLayer);
playerStyleFunc = function () {
    if (!(vapp.$data.showFriend) && this.get("_friend")) {
        return null;
    }
    // 圆形样式
    const baseStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: vapp.iconSize, // 圆形的半径
            fill: new ol.style.Fill({
                color: getColorWithTransparency(colors[this.get("_teamNumber") - 1], vapp.opacity)
            })
        })
    });


    // 玩家名称文字
    const playerText = new ol.style.Style({
        text: new ol.style.Text({
            font: "14px Calibri,sans-serif", // 字体加大到14px
            textAlign: "center",
            fill: new ol.style.Fill({
                color: "rgba(255,255,255,0.99)" // 文本填充颜色改为白色，提高对比度
            }),
            stroke: new ol.style.Stroke({
                color: "rgba(0,0,0,0.8)", // 添加黑色描边
                width: 3 // 描边宽度
            }),
            text: this.get("_name") || "", // 文本内容
            offsetY: 20, // 文本偏移量
            scale: vapp.$data.scale // 缩放比例
        })
    });

    // 队伍编号文字
    const teamText = new ol.style.Style({
        text: new ol.style.Text({
            font: `14px Calibri,sans-serif`,
            textAlign: "center",
            fill: new ol.style.Fill({
                color: "rgb(0,0,0)" // 文本填充颜色
            }),
            text: this.get("_teamNumber") > 100 ? "AI" : this.get("_teamNumber") || "", // 判断队伍编号是否大于 100
            offsetY: 1, // 向上偏移
            scale: vapp.$data.scale // 缩放比例
        })
    });

    // 初始化样式数组
    const styles = [baseStyle, playerText, teamText];

    // 如果是朋友且有射线，添加射线样式
    if (this.get("_friend") && this.get("_lineGeo")) {
        const lineStyle = new ol.style.Style({
            geometry: this.get("_lineGeo"),
            stroke: new ol.style.Stroke({
                color: vapp.$data.friendLine.color,
                width: vapp.$data.friendLine.width
            })
        });
        styles.push(lineStyle);
    }

    // 如果不是朋友且有射线，添加射线样式
    if ((!this.get("_friend")) && this.get("_lineGeo")) {
        const lineStyle = new ol.style.Style({
            geometry: this.get("_lineGeo"),
            stroke: new ol.style.Stroke({
                color: vapp.$data.enemyLine.color,
                width: vapp.$data.enemyLine.width
            })
        });
        styles.push(lineStyle);
    }

    return styles;
};

// 定义选定玩家样式
const meSource = new ol.source.Vector({
    wrapX: !1
});
const meLayer = new ol.layer.Vector({
    source: meSource
});
const mePoint = new ol.Feature({
    geometry: new ol.geom.Point([0, 0])
});
mePoint.setId("me");
mePoint.set("_radius", 6);
const meStyleFunc = function () {
    const a = [new ol.style.Style({
        image: new ol.style.Circle({
            radius: vapp.iconSize,
            fill: new ol.style.Fill({
                color: "rgba(255,255,255,1)"
            }),
            stroke: new ol.style.Stroke({
                width: this.get("_radius") - 1,
                color: "rgba(239,108,0,1)"
            })
        })
    })];

    return this.get("_lineGeo") && a.push(new ol.style.Style({
        geometry: this.get("_lineGeo"),
        stroke: new ol.style.Stroke({
            color: vapp.$data.selfLine.color,
            width: vapp.$data.selfLine.width
        })
    })), a
};
mePoint.setStyle(meStyleFunc);
meLayer.getSource().addFeature(mePoint);
meLayer.setZIndex(11);
paod_map_data.addLayer(meLayer);

//定义空投
const airdropSource = new ol.source.Vector({
    wrapX: !1
});
const airdropLayer = new ol.layer.Vector({
    source: airdropSource
});
const airdropPoint = new ol.Feature({
    geometry: new ol.geom.Point([0, 0])
});
airdropPoint.setId("airdrop");
airdropStyleFunc = function (feature) {
    return [
        new ol.style.Style({
            image: new ol.style.Icon({
                src: '\\img\\CarePackage_Normal.png', // 空投图片路径
                scale: 0.5, // 图片缩放比例
                anchor: [0.5, 0.5] // 图片锚点（中心点）
            })
        }),
        new ol.style.Style({
            text: new ol.style.Text({
                font: "12px Calibri,sans-serif", // 字体加大到14px
                textAlign: "center",
                fill: new ol.style.Fill({
                    color: "rgba(255,255,255,0.99)" // 文本填充颜色改为白色，提高对比度
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(0,0,0,0.8)", // 添加黑色描边
                    width: 2 // 描边宽度
                }),
                text: feature.get("_airdropName") || "", // 文本内容
                offsetY: 20, // 文本偏移量
                scale: vapp.$data.scale // 缩放比例
            })
        })
    ];
};
airdropLayer.getSource().addFeature(airdropPoint);
airdropLayer.setZIndex(11);
paod_map_data.addLayer(airdropLayer);

//定义载具 - 车
const vehiclesSource = new ol.source.Vector({
    wrapX: !1
});
const vehiclesLayer = new ol.layer.Vector({
    source: vehiclesSource
});
const vehiclesPoint = new ol.Feature({
    geometry: new ol.geom.Point([0, 0])
});
vehiclesPoint.setId("vehicles");
vehiclesStyleFunc = function (feature) {
    return [
        new ol.style.Style({
            image: new ol.style.Icon({
                src: '\\img\\MapVehicle.png', // 替换为你的图片路径
                scale: 0.5, // 图片缩放比例
                anchor: [0.5, 0.5] // 图片锚点（中心点）
            })
        }),
        new ol.style.Style({
            text: new ol.style.Text({
                font: "12px Calibri,sans-serif", // 字体加大到14px
                textAlign: "center",
                fill: new ol.style.Fill({
                    color: "rgba(255,255,255,0.99)" // 文本填充颜色改为白色，提高对比度
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(0,0,0,0.8)", // 添加黑色描边
                    width: 2 // 描边宽度
                }),
                text: feature.get("_vehiclesName") || "", // 文本内容
                offsetY: 20, // 文本偏移量
                scale: vapp.$data.scale // 缩放比例
            })
        })
    ];
};
vehiclesLayer.getSource().addFeature(vehiclesPoint);
vehiclesLayer.setZIndex(11);
paod_map_data.addLayer(vehiclesLayer);

//定义载具 - 船
const boatSource = new ol.source.Vector({
    wrapX: !1
});
const boatLayer = new ol.layer.Vector({
    source: boatSource
});
const boatPoint = new ol.Feature({
    geometry: new ol.geom.Point([0, 0])
});
boatPoint.setId("boat");
boatStyleFunc = function (feature) {
    return [
        new ol.style.Style({
            image: new ol.style.Icon({
                src: '\\img\\MapBoat.png', // 替换为你的图片路径
                scale: 0.5, // 图片缩放比例
                anchor: [0.5, 0.5] // 图片锚点（中心点）
            })
        }),
        new ol.style.Style({
            text: new ol.style.Text({
                font: "12px Calibri,sans-serif", // 字体加大到14px
                textAlign: "center",
                fill: new ol.style.Fill({
                    color: "rgba(255,255,255,0.99)" // 文本填充颜色改为白色，提高对比度
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(0,0,0,0.8)", // 添加黑色描边
                    width: 2 // 描边宽度
                }),
                text: feature.get("_boatName") || "", // 文本内容
                offsetY: 20, // 文本偏移量
                scale: vapp.$data.scale // 缩放比例
            })
        })
    ];
};
boatLayer.getSource().addFeature(boatPoint);
boatLayer.setZIndex(11);
paod_map_data.addLayer(boatLayer);

// 定义圈
const gridSource = new ol.source.Vector({
    wrapX: false
})
const zoneStyleFunc = function () {
    const style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: [0, 0, 0, 0]
        }), stroke: new ol.style.Stroke({
            color: this.get('_color'), width: 1.5
        })
    })
    return [style]
}
const gridLayer = new ol.layer.Vector({
    source: gridSource
})

// 定义安全区
const safeCircle = new ol.Feature({
    geometry: new ol.geom.Circle([-1, -1], 100)
})
safeCircle.setId('safe')
safeCircle.set('_color', 'rgba(255,255,255,0.9)')
safeCircle.setStyle(zoneStyleFunc)
gridSource.addFeature(safeCircle)

// 定义毒圈
const poisonCircle = new ol.Feature({
    geometry: new ol.geom.Circle([-1, -1], 150)
})
poisonCircle.setId('poison')
poisonCircle.set('_color', 'rgba(0,0,255,0.9)')
poisonCircle.setStyle(zoneStyleFunc)
gridSource.addFeature(poisonCircle)

gridLayer.setZIndex(10)
paod_map_data.addLayer(gridLayer)

let isZooming = false;

// 记录上一次中心点，用于判断是否发生了缩放
let previousCenter = paod_map_data.getView().getCenter();

// 在change:resolution事件中禁用视线跟随
paod_map_data.getView().on('change:resolution', function () {
    if (vapp.$data.followMe) {
        vapp.$data.followMe = false; // 禁用视线跟随
        isZooming = true; // 标记正在缩放
    }
});

// 在moveend事件中处理视线跟随
paod_map_data.on('moveend', function () {
    if (isZooming) {
        // 获取当前地图的中心点
        const currentCenter = paod_map_data.getView().getCenter();

        vapp.$data.followMe = true; // 恢复锁定状态

        // 更新记录的中心点
        previousCenter = currentCenter; // 更新记录的中心点
        isZooming = false; // 重置缩放状态
    }
});
$(document).ready(function () {
    let last_mapName, lastInGame;
    const socket = io();
    socket.emit("client");
    socket.on("update", (data) => {
        // 清空现有玩家数据
        playerSource.clear();
        airdropSource.clear();
        vehiclesSource.clear();
        boatSource.clear();
        
        const obj = JSON.parse(data);
        const {
            num,
            inGame: inGameValue,
            map_name, // 地图名称
            safeX, // 安全区 X
            safeY, // 安全区 Y
            safeR, // 安全区 R
            poisonX, // 毒区 X
            poisonY, // 毒区 Y
            poisonR, // 毒区 R
            xx, // 玩家 X
            yy, // 玩家 Y
            rr, // 玩家 Z
            name, // 玩家名
            team, // 玩家队伍
            health, // 玩家血量
            kills, // 玩家击杀
            friend, //队友
            rank, // 段位
            KDR, // KDA
            otherXX, // 载具，空投 X
            otherYY, // 载具，空投 Y
            otherType, // 载具，空投 类型
            otherName, // 载具，空投 名称
            level // 玩家等级
        } = obj;

        // 更新地图图层
        if (last_mapName !== map_name) {
            last_mapName = map_name;
            setVisibleMapLayer(map_name);
        }

        // 更新安全区和毒圈
        updateCircle(safeCircle, safeX, safeY, safeR);
        updateCircle(poisonCircle, poisonX, poisonY, poisonR);

        // 更新玩家数据
        if (lastInGame !== inGameValue && num > 0) {
            lastInGame = inGameValue;
            updatePlayerList(name, friend);
        }

        vapp.$data.followID = $('#followIDa').val();  // 使用 .val() 获取选中的玩家ID
        
        renderPlayers(num, xx, yy, rr, name, team, health, kills, friend);

        // 渲染空投，载具
        renderOther(otherXX, otherYY, otherType, otherName);

        // 渲染计分板
        renderScoreboard(num, team, name, rank, KDR, kills, level);
    });
});
   


// 设置地图图层可见性
function setVisibleMapLayer(activeLayerName) {
    console.log("changemap:"+activeLayerName);
    const layers = {
        'Tiger_Main': Tiger_Main,
        'Desert_Main': Desert_Main,
        'Kiki_Main': Kiki_Main,
        'Range_Main': Range_Main,
        'Baltic_Main': Baltic_Main,
        'Heaven_Main': Heaven_Main,
        'Savage_Main': Savage_Main,
        'DihorOtok_Main': DihorOtok_Main,
        'Chimera_Main': Chimera_Main,
        'Summerland_Main': Summerland_Main,
        'Neon_Main': Neon_Main,
    };
    Object.values(layers).forEach(layer => layer.setVisible(false));
    if (layers[activeLayerName]) layers[activeLayerName].setVisible(true);
}

// 更新圆形区域
function updateCircle(circle, x, y, r) {
    const geometry = circle.getGeometry();
    const center = geometry.getCenter();
    if (r !== geometry.getRadius() || x !== center[0] || y !== center[1]) {
        geometry.setCenterAndRadius([x, y], r);
    }
}

// 更新玩家列表
function updatePlayerList(nameArray, friendArray) {
    const $followSelect = $("#followIDa");

    // 清空所有无效选项，并打印正在移除的选项
    // console.log(
    //     "原始下拉框选项：",
    //     $followSelect.find("option").map(function () {
    //         return $(this).val();
    //     }).get()
    // );
    //
    // $followSelect.find("option").each(function () {
    //     const value = $(this).val();
    //     // 如果选项值为空、无意义的ID、纯数字或是 "0"，移除该选项
    //     if (!value || value.trim() === "" || /^\d+$/.test(value) || value === "0") {
    //         console.log("移除选项：", value); // 打印移除的选项值
    //         $(this).remove();
    //     }
    // });

    // 过滤无效ID，并构建新的选项值数组（只添加朋友）
    const newOptions = nameArray.filter((name, i) => friendArray[i] === 1 && name && name.trim() !== "");

    // 清空所有选项，确保 DOM 更新
    $followSelect.empty();

    // 如果锁定的玩家 ID 存在，先填充锁定的玩家
    if (vapp.$data.lockedPlayerID) {
        $followSelect.append(`<option value="${vapp.$data.lockedPlayerID}" selected disabled>${vapp.$data.lockedPlayerID}</option>`);
    }

    // 记录已经添加过的ID
    const addedIDs = new Set();

    // 填充新的玩家选项（但排除锁定的玩家和已经存在的玩家）
    newOptions.forEach(name => {
        // 如果当前选项不是锁定的玩家并且未被添加过，则添加
        if (name !== vapp.$data.lockedPlayerID && !addedIDs.has(name)) {
            $followSelect.append(`<option value="${name}">${name}</option>`);
            addedIDs.add(name);  // 标记该ID已经添加过
        }
    });

    // 打印最终下拉框的所有选项
    console.log("最终下拉框选项：", $followSelect.find("option").map(function () {
        return $(this).val();
    }).get());
}


// 渲染玩家数据
function renderPlayers(num, xxArray, yyArray, rrArray, nameArray, teamArray, healthArray, killsArray, friendArray) {
    
    let mer;
    for (let i = 0; i < num; i++) {
        const x = xxArray[i];
        const y = yyArray[i];
        const r = rrArray[i];
        const name = nameArray[i];
        const team = teamArray[i];
        const health = healthArray[i];
        const friend = friendArray[i];

        if (vapp.$data.followID === name) {
            // 渲染本人
            renderCurrentPlayer(x, y, r);
            mer = r;
            continue;
        }
        // 渲染其他玩家
        renderOtherPlayer(i, x, y, r, team, friend, name, health, mer);
    }
}

// 渲染当前玩家
function renderCurrentPlayer(x, y, r) {
    if (vapp.$data.followMe) {
        view.setCenter([x, y]);
    }
    vapp.$data.followRot ? view.set("rotation", (270 - r) / 180 * Math.PI) : view.set("rotation", 0);
    mePoint.getGeometry().setCoordinates([x, y]);
    const angle = r / 180 * Math.PI;
    mePoint.set("_lineGeo", new ol.geom.LineString([[x, y], [x + vapp.$data.selfLine.length * Math.cos(angle), y - vapp.$data.selfLine.length * Math.sin(angle)]]));
}

// 渲染其他玩家
function renderOtherPlayer(id, x, y, r, team, friend, name, health, mer) {
    const playerFeature = new ol.Feature({
        geometry: new ol.geom.Point([x, y])
    });
    playerFeature.setId(id);
    playerFeature.setStyle(playerStyleFunc);

    const angle = r / 180 * Math.PI;
    const yaw = vapp.$data.followRot ? (270 - mer) / 180 * Math.PI : 0;
    playerFeature.set("_rotation", angle + yaw);
    if (friend) {
        playerFeature.set("_lineGeo", new ol.geom.LineString([[x, y], [x + vapp.$data.friendLine.length * Math.cos(angle), y - vapp.$data.friendLine.length * Math.sin(angle)]]));
    } else {
        playerFeature.set("_lineGeo", new ol.geom.LineString([[x, y], [x + vapp.$data.enemyLine.length * Math.cos(angle), y - vapp.$data.enemyLine.length * Math.sin(angle)]]));
    }
    playerFeature.set("_friend", friend ? 1 : 0);
    playerFeature.set("_name", formatPlayerLabel(friend, name, health, team));
    playerFeature.set("_teamNumber", `${team}`); // 设置队伍编号
    playerSource.addFeature(playerFeature);
}

// 格式化玩家标签
function formatPlayerLabel(friend, name, health, team) {
    if (friend) {
        if (!vapp.$data.showName) return "队友";
        return `队友[${name}]`;
    }

    let label = '';
    if (vapp.$data.showName) {
        label += team > 100 ? '' : `[${name}]`;
    }

    if (vapp.$data.showHp) {
        if (label) {
            label += ` [${health}]`; // 同时显示时合并到一行
        } else {
            label = `[${health}]`; // 仅显示血量
        }
    }

    return label;
}
function isnull(obj){
    
    if (obj == undefined || obj == null) {
        return true;
    }
    return false;
}
// 渲染空投空投,载具
function renderOther(otherXX, otherYY, otherType, otherName) {
    if (isnull(otherXX)||isnull(otherYY)||isnull(otherType)||isnull(otherName)) {
       return ;
    }
    if (otherXX.length === otherYY.length && otherXX.length === otherType.length) {
        // 遍历每一个坐标点
        for (let i = 0; i < otherXX.length; i++) {
            const x = otherXX[i];
            const y = otherYY[i];
            const type = otherType[i];
            const name = otherName[i];
            // 载具渲染
            if (vapp.$data.showVehicles && (type === 0 || type === 1)) {
                // 车
                const vehiclesFeature = new ol.Feature({
                    geometry: new ol.geom.Point([x, y])
                });
                vehiclesFeature.setId(i)
                if (vapp.$data.showVehiclesName) {
                    vehiclesFeature.set("_vehiclesName", name);
                }
                vehiclesFeature.setStyle(vehiclesStyleFunc(vehiclesFeature))
                vehiclesSource.addFeature(vehiclesFeature);

                // 船
                const boatFeature = new ol.Feature({
                    geometry: new ol.geom.Point([x, y])
                });
                boatFeature.setId(i)
                if (vapp.$data.showVehiclesName) {
                    boatFeature.set("_boatName", name);
                }
                boatFeature.setStyle(boatStyleFunc(boatFeature))
                boatSource.addFeature(boatFeature);
            }

            // 空投渲染
            if (vapp.$data.showAirdrop && type === 2) {
                const airdropFeature = new ol.Feature({
                    geometry: new ol.geom.Point([x, y])
                });
                airdropFeature.setId(i)
                // airdropFeature.set("_airdropName", name);
                airdropFeature.setStyle(airdropStyleFunc(airdropFeature))
                airdropSource.addFeature(airdropFeature);
            }


        }
    } else {
        console.error("数组长度不一致");
    }
}

// 渲染战局信息计分板
function renderScoreboard(num, teamArray, nameArray, rankArray, kdArray, killsArray, levelArray) {
    // 将当前 players 数组转换为字符串形式
    const currentPlayersString = JSON.stringify(vapp.scoreboardPlayers);

    // 清空 players 数组
    vapp.scoreboardPlayers = [];

    // 循环添加新数据
    for (let i = 0; i < num; i++) {
        const team = teamArray[i];
        const name = nameArray[i];
        const rank = rankArray[i];
        const kd = kdArray[i];
        const kills = killsArray[i];
        const level = levelArray[i];

        vapp.scoreboardPlayers.push({
            id: i, team: team, name: name, rank: rank, kd: kd, kills: kills, level: level
        });
    }

    // 将更新后的 players 数组转换为字符串形式
    const newPlayersString = JSON.stringify(vapp.scoreboardPlayers);

    // 比较更新前后的数据是否相同
    if (currentPlayersString !== newPlayersString) {
        // 如果数据变化，更新视图
        vapp.$forceUpdate();
    }
}
