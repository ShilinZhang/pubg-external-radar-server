const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

server.listen(8899,(req, res)=>{
    console.log("Listening on 8899");
  });

app.get('/public/index.html',function(req,res){
    res.sendFile(__dirname + '/index.html');
}); 

app.use(express.static("public"));

io.on('connection', (socket) => {
    console.log(socket);
    socket.on('server', () => {
        console.log('Server Connected');
    });
    
    socket.on('client', () => {
        console.log('Client Connected');
    });
    
    socket.on('json', (data) => {
        console.log(data);
        io.emit("update", data);
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected');
    });
    
});









