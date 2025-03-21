// filepath: d:\College\Cave\ws1\server.js
const WebSocket = require('ws');

// Create a WebSocket server on port 8080
const server = new WebSocket.Server({ port: 8080 });

console.log("WebSocket server running on ws://localhost:8080");

// Store connected clients
let clients = new Set();

server.on('connection', (ws) => {
    console.log('A player connected');
    clients.add(ws);

    // Send a welcome message to the new client
    ws.send(JSON.stringify({ message: "Welcome to the WebSocket server!" }));

    // Listen for messages from clients
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);

        // Broadcast message to all connected clients
        clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('A player disconnected');
        clients.delete(ws);
    });
});