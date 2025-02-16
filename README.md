# PUBG-EXTERNAL-RADAR-SERVER
## Building
<b>Radar and Communication Server (/nodejs):</b>
1. Download and install the required dependencies.
2. Navigate to /nodejs and run:
```bash
npm install
node server.js
```
## Example.cpp
* [Socket.IO C++ Client](https://github.com/socketio/socket.io-client-cpp)
* [nlohmann/json](https://github.com/nlohmann/json)
```
#include "utils/sio_client.h"
#include "utils/json.hpp"
sio::client io;
nlohmann::json j;
void main() {
    j["map_name"] = "Range_Main";
    j["otherXX"] = { 0,1000,3000,5000,7000 };
    j["otherYY"] = { 0,1000,3000,5000,7000 };
    j["otherType"] = { 1,2,1,2,1 };
    j["otherName"] = { "aa","bb","cc","dd","ee" };
    j["rank"] = { 1,2,3,4,5 };
    j["KDR"] = { 3,3,3,4,5 };
    j["inGame"] = 4;
    j["num"] = 5;
    j["xx"] = { 0,2000,4096,6000,8192 };
    j["yy"] = { 0,2000,4096,6000,8192 };
    j["rr"] = { 0,30,60,90,120, };
    j["name"] = { "aa","bb","cc","dd","ee" };
    j["team"] = { 1,2,3,4,5 };
    j["health"] = { 10,30,60,80,100 };
    j["friend"] = { 0,1,1,1,0 };
    j["kills"] = { 1,2,3,4,5 };
    j["level"] = { 10,30,60,80,100 };
    io.connect("http://127.0.0.1:8899/");
    const auto data = j.dump();
    io.socket()->emit("json", data);
}
```
