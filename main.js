global.INSTANCE_ID = process.env.FLY_ALLOC_ID || '601c3c2b-1df1-1d49-30de-b6111aa52bd5';
global.REGION_CODE = process.env.FLY_REGION || 'LOCAL_REGION';

const path = require('path');
const fastify = require('fastify')({logger: true});

const {initPubSub, deleteSubscription, onPubSubMessage, sendWsMessageToTopic} = require('./pub-sub.js');

fastify.register(require('fastify-websocket'),{
	options: {
		clientTracking: true
	}
});

fastify.register(require('fastify-static'), {
	root: path.join(__dirname, 'static')
});

fastify.get('/ws', { websocket: true }, (connection) => {

	const jsonString = JSON.stringify({
		message: `CONNECTED`,
		regionCode: REGION_CODE
	});

	connection.socket.send(jsonString);

	connection.socket.on('message', (wsMessage) => {
		console.log('WS message received at', REGION_CODE, wsMessage);
		sendWsMessageToTopic(wsMessage);
	});
});

// Delete the subscription when Fly is requesting to kil the VM

async function onVmKill () {
	fastify.log.info('VM Kill requested for instance ' + INSTANCE_ID);
	await deleteSubscription();
	fastify.log.info('PubSub subscription deleted for instance ' + INSTANCE_ID);
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

	fastify.listen(process.env.PORT || 8080, '0.0.0.0', (error) => {
		if (error) {
			fastify.log.error(error);
			process.exit(1)
		}
	});
})();