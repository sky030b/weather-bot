const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const messageModel = require('../models/messageModel');
const { uploadToDB, updateToDB, addUserToDB, updateUserToDB } = require('../models/uploadToDB');

exports.handleConnection = (ws, wss) => {
    const userId = uuidv4(); // Generate a unique user ID
    ws.userId = userId; // Assign the UUID to the WebSocket instance

    ws.send(JSON.stringify({ type: 'id', id: userId })); // Send the UUID to the client

    ws.on('message', async (message) => {
        const messageStr = message.toString(); // Convert buffer to string
        console.log('Received message:', messageStr); // Log received messages
        const chatMessage = messageModel.createMessage(messageStr, userId);
        broadcastMessage(chatMessage, wss);

        await uploadToDB(chatMessage);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
};

const broadcastMessage = (message, wss) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};