global.INSTANCE_ID = process.env.FLY_ALLOC_ID || 'LOCAL_INSTANCE_ID';

const path = require('path');
const fastify = require('fastify')({logger: true});

const {initPubSub, deleteSubscription, onPubSubMessage, sendMessageToTopic} = require('./pub-sub.js');

fastify.register(require('fastify-websocket'),{
	options: {
		clientTracking: true
	}
});

fastify.register(require('fastify-static'), {
	root: path.join(__dirname, 'static')
});

fastify.get('/ws', { websocket: true }, (connection) => {
	connection.socket.on('message', message => {
		console.log('WS message received:', message);
		connection.socket.send(`Welcome!`);
	});
});

async function onVmKill () {
	fastify.log.info('VM Kill requested for instance ' + INSTANCE_ID);
	await deleteSubscription();
	fastify.log.info('PubSub subscription deleted for instance ' + INSTANCE_ID);
	sendMessageToAllClients('Server closing down!')
    process.exit();
}

process.on('SIGINT', onVmKill);

function sendMessageToAllClients (message) {
	fastify.websocketServer.clients.forEach((client) => {
		if (client.readyState === 1) {
			client.send(message);
		}
	});
}

onPubSubMessage.add(sendMessageToAllClients);

(async () => {
	await initPubSub();

	fastify.log.info('PubSub ready!');

	fastify.listen(3000, err => {
		if (err) {
			fastify.log.error(err)
			process.exit(1)
		}
	});
})();

setInterval(async () => {
	const date = new Date();
	const message = `Current time is ${date.toISOString()}`
	await sendMessageToTopic(message);
}, 5000);