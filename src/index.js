import 'babel-polyfill';
import urlTemplate from 'url-template';
import HJSON from 'hjson';
import path from 'path';
import appRoot from 'app-root-path';
import debug from 'debug';
import _ from 'lodash/fp';
import fs from 'fs';
import {logger} from './logger';
import {gitterClients} from './gitter-clients';
import {
	getFileWriteStream, 
	saveMessages, 
	saveError,
} from './save-messages';

const log = debug('gitter-archive');

const URL = HJSON.parse(fs.readFileSync(path.resolve(`${appRoot}/url-templates.hjson`), 'utf-8'));
const {env} = require(`${appRoot}/config/app-config`);
const {GITTER_HOST = 'api.gitter.im', GITTER_API_VERSION = 'v1', GITTER_TOKEN = ''} = env;

// =================== <DELETE> =====================

const groupRoomsTemplate = urlTemplate.parse(URL['group-rooms']);

const getGitterEndpoint = (template, opts) => {
	const __template = _.isString(template) ? urlTemplate.parse(template) : template;
	const __endpoint = __template.expand(opts);
	const endpoint = `https://${GITTER_HOST}/${GITTER_API_VERSION}${__endpoint}`;
	return endpoint;
}

const fetchAllRoomInfoAsync = async ({groupId} = {}) => {
	const endpoint = getGitterEndpoint(groupRoomsTemplate, {group_id: groupId});

	log('Group Rooms Endpoint: %o', endpoint);
	logger.info(`Group Rooms Endpoint: ${endpoint}`);
};

// ===================== </DELETE> =====================

const getEarliestMessageId = _.flow(_.first, _.get('id'));

let totalMessagesRetrieved = 0;
const fetchAllRoomMessagesAsync = async ({roomId, beforeId, skip = 0, ...restparam} = {}) => {
	const {groupId, roomUri, hasErrors = false, errorWriter, messageWriter} = restparam;

	try {
		// get a message set
		const {messages} = await gitterClients[0].getChatMessages({
			roomId,
			beforeId,
			skip,
		});

		// for empty message set, mark completion of the room archive
		if (_.isEmpty(messages)) {
			const errorMessage = hasErrors ? 'with errors' : 'with no errors';
			logger.info(`Room: ${roomUri} (${roomId}) archive completed ${errorMessage}.`);
			return undefined;
		}

		const messagesCount = _.size(messages);
		totalMessagesRetrieved += messagesCount;
		logger.info(`Room Messages Count = ${messagesCount}`);
		logger.info(`Total Room Messages Retrieved = ${totalMessagesRetrieved}`);
		
		saveMessages({writer: messageWriter, messages, roomId, roomUri});

		const __beforeId = getEarliestMessageId(messages);
		fetchAllRoomMessagesAsync({roomId, beforeId: __beforeId, skip, hasErrors, groupId, roomUri, errorWriter, messageWriter});
	} catch (err) {
		console.error(err);
		saveError({writer: errorWriter, error: err, roomId, beforeId, skip, roomUri});
	}
};

// fetchAllRoomInfoAsync({groupId: '57542cf4c43b8c6019778297' /* FreeCodeCamp */});
// fetchAllRoomMessagesAsync({
// 	roomId: '546fd572db8155e6700d6eaf' /* FreeCodeCamp/FreeCodeCamp */,
// 	groupId: '57542cf4c43b8c6019778297' /* FreeCodeCamp */,
// 	roomUri: 'FreeCodeCamp/FreeCodeCamp',
// 	beforeId: '583b73bb381827c24d8b19e3',
// 	get messageWriter() {
// 		return getMessageWriter(this.roomUri);
// 	},
// 	get errorWriter() {
// 		return getErrorWriter(this.roomUri);
// 	},
// });

module.exports = {
	fetchAllRoomMessagesAsync,
	getFileWriteStream,
};
