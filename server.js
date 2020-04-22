const server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Use a real db
const db = {
    rooms: {}
};

app.get('/', (req, res) => {
    res.send('Server started');
});

io.on('connection', (socket) => {
    // Authentication
    console.log('user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(server_port, server_ip_address, () => {
    console.log('IMYC Server started on ip=<' + server_ip_address + '> with port=<' + server_port + '>');
});