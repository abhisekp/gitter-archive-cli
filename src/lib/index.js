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
import {env} from './app-config';
import {pickDeepAll} from './util';

const log = debug('gitter-archive');

const {GITTER_HOST = 'api.gitter.im', GITTER_API_VERSION = 'v1', GITTER_TOKEN = ''} = env;

const getEarliestMessageId = _.flow(_.first, _.get('id'));

let totalMessagesRetrieved = 0;
const fetchAllRoomMessagesAsync = async ({roomId, beforeId, skip = 0, ...restparam} = {}) => {
	const {groupId, roomUri, hasErrors = false, errorWriter, messageWriter, store} = restparam;

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
			store.updateRoom({id: roomId}, 'isArchived', true);
			logger.close();
			return undefined;
		}

		const messagesCount = _.size(messages);
		totalMessagesRetrieved += messagesCount;
		logger.info(`Room Messages Count = ${messagesCount}`);
		logger.info(`Total Room Messages Retrieved = ${totalMessagesRetrieved}`);
		
		saveMessages({writer: messageWriter, messages, roomId, roomUri});
		store.updateRoom({id: roomId}, 'beforeId', beforeId);
		store.updateRoom({id: roomId}, 'skip', skip);

		const __beforeId = getEarliestMessageId(messages);
		fetchAllRoomMessagesAsync({roomId, beforeId: __beforeId, skip, hasErrors, groupId, roomUri, errorWriter, messageWriter, store});
	} catch (err) {
		console.error(err);
		saveError({writer: errorWriter, error: err, roomId, beforeId, skip, roomUri});
		logger.close();
	}
};

module.exports = {
	fetchAllRoomMessagesAsync,
	getFileWriteStream,
	gitterClients,
	logger,
	pickDeepAll,
};
