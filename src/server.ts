import {Player} from './player';
import {PlayerService} from './player.service';
import {RushService} from './rush.service';
import {Rush} from './rush';
import {ServerConfig} from './server.config';

// Context
const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

// Services
const uuid = require('uuid');

// Server
app.get('/', (req: any, res: any) => {
    res.send('Server started');
});

io.on('connection', (socket: any) => {
    const playerService = new PlayerService(socket, uuid);
    const rushService = new RushService(socket, uuid, playerService);

    // Authentication
    socket.on('disconnect', () => {
        rushService.leave();
        playerService.delete();
    });

    // Rush
    socket.on('create-rush', (ownerName: string) => {
        const owner = playerService.create(ownerName);
        const rush = rushService.create(owner.uuid);
        rushService.join(rush);
    }).on('join-rush', (playerName: string, rushUuid: string) => {
        playerService.create(playerName);
        const rush = rushService.find(rushUuid);
        rushService.join(rush);
    }).on('leave-rush', () => {
        rushService.leave(socket);
    });
});

server.listen(ServerConfig.port, ServerConfig.ip, () => {
    console.log('Server started on ip=<' + ServerConfig.ip + '> with port=<' + ServerConfig.port + '>');
});