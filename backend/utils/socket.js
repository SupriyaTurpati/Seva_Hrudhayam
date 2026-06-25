let io = null;

const init = (ioServer) => {
  io = ioServer;
  
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // User registers their room based on role & ID
    socket.on('join_room', (data) => {
      const { role, userId } = data;
      if (role && userId) {
        const roomName = `${role}_${userId}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined room: ${roomName}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  init,
  getIO
};
