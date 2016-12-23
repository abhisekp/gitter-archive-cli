import 'babel-polyfill';
import debug from 'debug';
import _ from 'lodash/fp';
import {logger} from './logger';
import {gitterClients, getNextGitterClient} from './gitter-clients';
import {
	getFileWriteStream,
	saveMessages,
	saveError,
} from './save-messages';
import {pickDeepAll} from './util';

const log = debug('gitter-archive');

const getEarliestMessageId = _.flow(_.first, _.get('id'));

let loggerCloseTimeoutId;
const fetchAllRoomMessagesAsync = async ({roomId, beforeId, skip = 0, ...restparam} = {}) => {
	// every time check if a timeout is set to close the logger
	// if messages are still being retrieved, then clear timeout
	if (loggerCloseTimeoutId) {
		clearTimeout(loggerCloseTimeoutId);
	}

	const {
		groupId, roomUri, hasErrors = false,
		errorWriter, messageWriter, store, messageCount: totalMessageCount = 0,
	} = restparam;

	store.updateRoom({id: roomId}, 'beforeId', beforeId);
	store.updateRoom({id: roomId}, 'skip', skip);

	try {
		// get a message set
		const {messages} = await getNextGitterClient().getChatMessages({
			roomId,
			beforeId,
			skip,
		});

		const __messageCount = _.size(messages);
		const __totalMessageCount = totalMessageCount + __messageCount;
		store.updateRoom({id: roomId}, 'messageCount', __totalMessageCount);
		logger.info(`Room Messages Count = ${__messageCount}`);
		logger.info(`Total Room Messages Retrieved = ${__totalMessageCount}`);

		saveMessages({writer: messageWriter, messages, roomId, roomUri});

		// for message set less than LIMIT = 100, mark completion of the room archive
		if (__messageCount < 100) {
			const errorMessage = hasErrors ? 'with errors' : 'with no errors';
			logger.info(`Room: ${roomUri} (${roomId}) archive completed ${errorMessage}.`);
			store.updateRoom({id: roomId}, 'isArchived', true);

			// close logger after 120 seconds (2 mins) so that it is immune to penalty of extra 1 minute
			loggerCloseTimeoutId = setTimeout(::logger.close, 120e3 /* 120 seconds */);

			return undefined;
		}

		const __beforeId = getEarliestMessageId(messages);

		store.updateRoom({id: roomId}, 'beforeId', __beforeId);
		store.updateRoom({id: roomId}, 'skip', skip);

		return fetchAllRoomMessagesAsync({
			roomId, beforeId: __beforeId, skip, hasErrors, groupId, roomUri,
			errorWriter, messageWriter, store, messageCount: __totalMessageCount,
		});
	} catch (err) {
		console.error(err);
		saveError({writer: errorWriter, error: err, roomId, beforeId, skip, roomUri});
	}
};

module.exports = {
	fetchAllRoomMessagesAsync,
	getFileWriteStream,
	gitterClients,
	getNextGitterClient,
	logger,
	pickDeepAll,
};
