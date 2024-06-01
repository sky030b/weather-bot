document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket('ws://localhost:5000');
    let userId;

    // Log connection status
    ws.onopen = () => {
        console.log('WebSocket connection opened');
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'id') {
            userId = message.id; // Store the user ID
            console.log('Received user ID:', userId);
        } else {
            displayMessage(message);
        }
    };

    document.getElementById('sendButton').onclick = () => {
        const input = document.getElementById('messageInput');
        const message = input.value;
        if (message.trim()) {
            ws.send(message);
            input.value = '';
        }
    };

    const displayMessage = (message) => {
        const messagesDiv = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.textContent = `[${message.timestamp}] ${message.userId}: ${message.content}`;
        messagesDiv.appendChild(messageElement);
    };
});
