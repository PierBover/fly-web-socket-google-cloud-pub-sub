const server = 'ws://' + location.host + '/ws'
const socket = new WebSocket(server);

const messagesElement = document.getElementById('messages');
const button = document.getElementById('button');

button.addEventListener('click', () => {
	if (socket.readyState === 1) {
		socket.send(JSON.stringify({
			message: 'ALIEN_LANDING',
			timestamp: Date.now()
		}));
	} else {
		console.log('Socket is closed!');
	}
});

const regions = [
	{code: 'ams', name: 'Amsterdam, Netherlands'},
	{code: 'atl', name: 'Atlanta, Georgia (US)'},
	{code: 'cdg', name: 'Paris, France'},
	{code: 'dfw', name: 'Dallas, Texas (US)'},
	{code: 'ewr', name: 'Parsippany, NJ (US)'},
	{code: 'fra', name: 'Frankfurt, Germany'},
	{code: 'gru', name: 'Sao Paulo, Brazil'},
	{code: 'hkg', name: 'Hong Kong'},
	{code: 'iad', name: 'Ashburn, Virginia (US)'},
	{code: 'lax', name: 'Los Angeles, California (US)'},
	{code: 'lhr', name: 'London, United Kingdom'},
	{code: 'nrt', name: 'Tokyo, Japan'},
	{code: 'ord', name: 'Chicago, Illinois (US)'},
	{code: 'scl', name: 'Santiago, Chile'},
	{code: 'sea', name: 'Seattle, Washington (US)'},
	{code: 'sin', name: 'Singapore'},
	{code: 'sjc', name: 'Sunnyvale, California (US)'},
	{code: 'syd', name: 'Sydney, Australia'},
	{code: 'vin', name: 'Vint Hill, Virginia'},
	{code: 'yyz', name: 'Toronto, Canada'},
	{code: 'LOCAL_REGION', name: 'Local region for dev'}
];

socket.addEventListener('open', function (event) {
	console.log('WS socket open');
});

socket.addEventListener('close', function (event) {
	console.log('WS socket closed!');

	const div = document.createElement("div");
	div.textContent = `😱 you've been disconnected from the WS server!`;
	messagesElement.prepend(div);
});

socket.addEventListener('message', function (event) {
	console.log('WS message received:', event.data);

	const json = JSON.parse(event.data);
	const div = document.createElement("div")

	switch (json.message) {
		case 'ALIEN_LANDING':
			const landingRegion = regions.find(region => region.code === json.regionCode);
			const delta = Date.now() - json.timestamp;
			div.innerHTML = `🚨🚨🚨 Alien landing near <strong>${landingRegion.name}</strong> ${delta}ms ago!`;
			break;
		case 'CONNECTED':
			const connectedRegion = regions.find(region => region.code === json.regionCode);
			div.innerHTML = `🎉 Connected to WS server running in <strong>${connectedRegion.name}</strong>`;
			break;
	}

	messagesElement.prepend(div);
});