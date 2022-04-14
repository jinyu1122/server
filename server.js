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


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('callerping', () => {
      console.log('callerping');
      socket.emit('callerpong');
      callerAppId = socket.id;
    });

    socket.on('calleeping', () => {
      console.log('calleeping');
      calleeAppId = socket.id;
      socket.emit('calleepong');
    });

    socket.on('offer', (data) => {
      console.log('caller offer:', data);
      socket.to(calleeAppId).emit('offer', data);
    });

    socket.on('answer', (data) => {
      console.log('receive answer from callee');
      socket.to(callerAppId).emit('answer', data);
    });

    socket.on('config', (data) => {
      console.log('receive config from caller');
      socket.to(calleeAppId).emit('config', data);
    });

    socket.on('iceFromCaller', (data) => {
      console.log('receive ice from caller on server');
      socket.to(calleeAppId).emit('candidate', data);
    });

    socket.on('iceFromCallee', (data) => {
      console.log('receive ice from callee on server');
      socket.to(callerAppId).emit('candidate', data);
    });

    socket.on('rtcConfig', (data) => {
      socket.to(calleeAppId).emit('rtcConfig', data);
    });

    socket.on('rtcOffer', (data) => {
      console.log('relay rtc offer');
      socket.to(callerAppId).emit('rtcOffer', data);
    })

    socket.on('rtcAnswer', (data) => {
      console.log('relay rtc answer');
      socket.to(calleeAppId).emit('rtcAnswer', data);
    });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});