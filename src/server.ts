import express from 'express';
import expressPino from 'express-pino-logger';
import http from 'http';
import pino from 'pino';
import socketIo, {Socket} from 'socket.io';

import {LobbyGroupHandler, LobbyRoomHandler} from './handlers';
import {ServerConfig} from './server.config';
import {AppSocket} from './sockets';

// Context
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Logging
const logger = pino({level: process.env.LOG_LEVEL || 'info'});
const expressLogger = expressPino({logger});

// Server
app.use(express.static('public'));
app.use(expressLogger);

// Socket io
const lobbyRoomHandler = new LobbyRoomHandler();
const handlers = [
    new LobbyGroupHandler(),
    lobbyRoomHandler,
];

io.on('connection', (socket: Socket) => {
    logger.info('User connected');
    const roomSocket = new AppSocket(socket);
    handlers.forEach(handler => handler.bindEvents(roomSocket));

    socket.on('disconnect', () => {
        logger.info('User disconnected');
        lobbyRoomHandler.leaveRoom(roomSocket);
    });
});

// FIXME hostname throw a compilation error !!!
(<any>server).listen(ServerConfig.port, ServerConfig.hostname, () => {
    logger.info('Server running on %s:%d', ServerConfig.hostname, ServerConfig.port);
});