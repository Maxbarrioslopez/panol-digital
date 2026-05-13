import { Server, Socket } from 'socket.io';

export function setupWebSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} unido a ${room}`);
    });

    socket.on('leave-room', (room: string) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
}

export function notifyRoom(io: Server, room: string, event: string, data: any) {
  io.to(room).emit(event, data);
}
