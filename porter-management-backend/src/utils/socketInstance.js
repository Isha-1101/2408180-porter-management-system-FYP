/**
 * Singleton Socket.IO instance accessor.
 * Set once from index.js after io is created, then import getIO() anywhere.
 */
let _io = null;

export const setIO = (io) => {
  _io = io;
};

export const getIO = () => {
  if (!_io) throw new Error("Socket.IO has not been initialised yet");
  return _io;
};
