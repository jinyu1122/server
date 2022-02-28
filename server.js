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

let clientAppId;
let testClientId;

let newTabId;


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('appping', () => {
      console.log('appping');
      socket.emit('apppong');
      clientAppId = socket.id;
    });

    // socket.on('testping', () => {
    //   console.log('testping');
    //   socket.emit('testpong');
    //   testClientId = socket.id;
    // });

    socket.on('tabping', () => {
      console.log('tabping');
      newTabId = socket.id;
      socket.emit('tabpong');
      socket.to(clientAppId).emit('tabConnected');
    });

    socket.on('pyping', () => {
      console.log('pyping');
      socket.emit('pypong', {name: 'haha'});
      testClientId = socket.id;
    });

    socket.on('offer', (data) => {
      console.log('server offer:', data);
      socket.to(testClientId).emit('offer', data);
    });

    socket.on('answer', (data) => {
      console.log('receive answer on server');
      socket.to(clientAppId).emit('answer', data);
    });

    socket.on('config', (data) => {
      console.log('receive config on server');
      socket.to(testClientId).emit('config', data);
    });

    socket.on('iceFromCaller', (data) => {
      console.log('receive ice from caller on server');
      socket.to(testClientId).emit('candidate', data);
    });

    socket.on('iceFromCallee', (data) => {
      console.log('receive ice from calee on server');
      socket.to(clientAppId).emit('candidate', data);
    });

    socket.on('rtcConfig', (data) => {
      socket.to(newTabId).emit('rtcConfig', data);
    });

    socket.on('rtcOffer', (data) => {
      console.log('relay rtc offer');
      socket.to(clientAppId).emit('rtcOffer', data);
    })

    socket.on('rtcAnswer', (data) => {
      console.log('relay rtc answer');
      socket.to(newTabId).emit('rtcAnswer', data);
    });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});