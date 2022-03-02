const express = require('express')
const cors = require('cors');
const http = require('http');
const path = require('path');
const app = express()

app.use(cors());
app.options('*', cors());

// app.use(express.static(path.join(__dirname, 'client-app', 'build')));


const server = http.createServer(app);

const { Server, Socket } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'OPTION', 'POST']
  }
});

const port = 8080

let callerAppId;
let calleeAppId;
let config;
let offer;
let callerICEs = [];


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (socket.id === callerAppId) {
          callerAppId = null;
        }
        if (socket.id === calleeAppId) {
          calleeAppId = null;
        }
    });
    socket.on('callerping', () => {
      console.log('callerping');
      socket.emit('callerpong');
      callerAppId = socket.id;
    });

    socket.on('calleeping', () => {
      console.log('calleeping');
      socket.emit('calleepong');
      calleeAppId = socket.id;
      if (config) {
        socket.emit('config', config);
        config = null;
      }
      if (offer) {
        socket.emit('offer', offer);
        offer = null;
      }
      while (callerICEs.length > 0) {
        const last = callerICEs.pop();
        socket.emit('candidate', last);
      }
    });

    socket.on('offer', (data) => {
      console.log('server offer:', data);
      if (calleeAppId) {
        socket.to(calleeAppId).emit('offer', data);
      } else {
        offer = data;
      }
    });

    socket.on('answer', (data) => {
      console.log('receive answer on server');
      socket.to(callerAppId).emit('answer', data);
    });

    socket.on('config', (data) => {
      console.log('receive config on server');
      if (calleeAppId) {
        socket.to(calleeAppId).emit('config', data);
      } else {
        config = data;
      }
    });

    socket.on('iceFromCaller', (data) => {
      console.log('receive ice from caller on server');
      if (calleeAppId) {
        socket.to(calleeAppId).emit('candidate', data);
      } else {
        callerICEs.push(data);
      }
    });

    socket.on('iceFromCallee', (data) => {
      console.log('receive ice from calee on server');
      socket.to(callerAppId).emit('candidate', data);
    });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// app.get('/', (req, res) => {
//     res.sendFile(__dirname+'/client-app/build' + '/index.html');
//   });