import express, {Request, Response} from 'express';
import expressPino from 'express-pino-logger';
import {readFileSync} from 'fs';
import http from 'http';
import pino from 'pino';
import socketIo, {Socket} from 'socket.io';

import {LobbyGroupHandler, LobbyPlayerHandler, LobbyRushHandler} from './handlers';
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

app.get('/api/settings', (req: Request, res: Response) => res.send(readFileSync('data/settings.json')));

// Socket io
// TODO ameliorate event bindings (conditional, add unbind, binding by status, etc.)
const lobbyRushHandler = new LobbyRushHandler();
const handlers = [
  new LobbyGroupHandler(),
  new LobbyPlayerHandler(),
  lobbyRushHandler,
];

io.on('connection', (socket: Socket) => {
  logger.info('User connected');
  const rushSocket = new AppSocket(socket);
  handlers.forEach(handler => handler.bindEvents(rushSocket));

  socket.on('disconnect', () => {
    logger.info('User disconnected');
    lobbyRushHandler.leaveRush(rushSocket);
  });
});

// FIXME hostname throw a compilation error !!!
/*(<any>server).listen(ServerConfig.port, ServerConfig.hostname, () => {
  logger.info('Server running on %s:%d', ServerConfig.hostname, ServerConfig.port);
});*/
// FIXME use previous method for deployment
server.listen(8080);
