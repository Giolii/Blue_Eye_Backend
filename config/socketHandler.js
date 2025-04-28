module.exports = (connectedUsers) => (socket) => {
  const user = socket.user;

  if (user) {
    connectedUsers.set(user.id, socket.id);
    console.log(`✅ User ${user.id} connected - Socket ID: ${socket.id}`);

    socket.emit("authenticated", { userId: user.id });

    socket.on("disconnect", () => {
      connectedUsers.delete(user.id);
      console.log(`❌ User ${user.id} disconnected`);
    });
  } else {
    socket.disconnect();
    return;
  }
};
