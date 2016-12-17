import csvWriter from 'csv-write-stream';
import path from 'path';
import appRoot from 'app-root-path';
import _ from 'lodash/fp';
import fs from 'fs';
import {pickDeepAll} from './util';
import {logger} from './logger';

const getFileWriteStream = ({filePath, headers} = {}) => {
	if (!_.isString(filePath)) {
		throw new Error('Specify full filepath for saving the messages.');
	}

	const fsWriteStream = fs.createWriteStream(path.resolve(`${filePath}.tsv`), {
		flags: 'a', /* append */
	});

	const fileWriter = csvWriter({
		separator: '\t',
		newline: '\r\n',
		headers,
		sendHeaders: false,
	});
	fileWriter.pipe(fsWriteStream);

	return fileWriter;
};

const saveError = ({error, writer, ...restparam} = {}) => {
	const {roomId, roomUri, beforeId, skip} = restparam;

	const __error = {
		err_message: _.isObject(error) ? error.message : error,
		roomId,
		beforeId,
		roomUri,
		skip,
	};

	console.dir(__error, {colors: 1});

	writer.write(__error);
}

const saveMessages = ({messages, writer, ...restparam} = {}) => {
	const {roomId, roomUri} = restparam;

	// console.dir(messages, {colors: 1});

	// parse and get messages for saving
	const __messages = _.map(pickDeepAll(['text', {
		message_id: 'id',
		sent_at: 'sent',
		from_userid: 'fromUser.id',
		from_username: 'fromUser.username',
	}]), messages);

	const __injected_messages = _.map(_.assign({room_id: roomId, room_uri: roomUri}), __messages);

	const earliestMessage = _.first(__injected_messages);
	logger.info(`Earliest Message ID: ${_.get('message_id', earliestMessage)}`);

	console.dir(earliestMessage, {colors: 1});

	// save each message one by one but **in reverse order** 
	// so that earliest message is at the top and the oldest message is at the bottom.
	_.forEachRight(message => {
		writer.write(message);
	}, __injected_messages);
};

export {
	getFileWriteStream,
	saveMessages,
	saveError,
};
