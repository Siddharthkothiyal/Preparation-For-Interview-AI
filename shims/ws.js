// Make 'ws' resolve to React Native's global WebSocket.
// This avoids importing the Node-only 'ws' package and its dependencies.
module.exports = global.WebSocket;
// ... existing code ...