const Signal = require('mini-signals');
const onPubSubMessage = new Signal();

const {PubSub} = require('@google-cloud/pubsub');
const pubSubClient = new PubSub({keyFilename: 'google-service-account.json'});

const TOPIC_NAME = 'USER_NOTIFICATIONS';
const SUBSCRIPTION_NAME = INSTANCE_ID;

let topic, subscription;

async function initPubSub () {
	await initTopic();
	await initSubscription();
}

// Create the topic if it does not already exist on PubSub

async function initTopic () {
	const [topics] = await pubSubClient.getTopics();

	topic = topics.find((topic) => {
		// Extract the topic name from its full path: projects/{project}/topic/{topic}
		const split = topic.name.split('/');
		const name = split[split.length - 1];
		return name === TOPIC_NAME;
	});

	if (!topic) {
		[topic] = await pubSubClient.createTopic(TOPIC_NAME);
	}
}

// Create the subscription if it does not already exist on PubSub

async function initSubscription () {
	const [subscriptions] = await topic.getSubscriptions();

	subscription = subscriptions.find((subscription) => {
		// Extract the subscription name from its full path: projects/{project}/subscriptions/{sub}
		const split = subscription.name.split('/');
		const name = split[split.length - 1];
		return name === SUBSCRIPTION_NAME;
	});

	if (!subscription) {
		[subscription] = await topic.createSubscription(SUBSCRIPTION_NAME);
	}

	subscription.on('message', onMessageHandler);
}

function onMessageHandler (pubSubMessage) {
	const message = pubSubMessage.data.toString();
	pubSubMessage.ack();
	onPubSubMessage.dispatch(message);
}

async function deleteSubscription () {
	await subscription.delete();
}

async function sendMessageToTopic (message) {
	const buffer = Buffer.from(message);
	await topic.publish(buffer);
}

module.exports = {
	initPubSub,
	deleteSubscription,
	sendMessageToTopic,
	onPubSubMessage
};