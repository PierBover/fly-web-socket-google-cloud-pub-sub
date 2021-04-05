const server = 'ws://' + location.host + '/ws'
const socket = new WebSocket(server);
const messagesElement = document.getElementById('messages');

socket.addEventListener('open', function (event) {
	socket.send('Hello Server!');
});

socket.addEventListener('message', function (event) {
	const div = document.createElement("div")
	div.textContent = 'WS: ' + event.data;
	messagesElement.appendChild(div);
});