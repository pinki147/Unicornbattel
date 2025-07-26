const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = new Map();

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).substr(2, 9);
  players.set(id, { id });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      data.id = id;
      players.set(id, data);
      const payload = JSON.stringify([...players.values()]);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    } catch (e) {
      console.error('Invalid message:', message);
    }
  });

  ws.on('close', () => {
    players.delete(id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});