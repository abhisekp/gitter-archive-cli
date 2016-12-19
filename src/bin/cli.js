#!/usr/bin/env node

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

var path = require('path');
var appRoot = require('app-root-path');
var gArc = require(String(appRoot));

var beforeId = process.argv[2];
console.log('Before ID: ' + beforeId);

// var groupName = process.argv[2] || process.exit(1);
// console.log('Group rooms to archive: ' + groupName);

// var archiveDirPath = path.resolve(process.argv[3] || './archives');
// console.log('Archive Path set to ' + archiveDirPath);

var getMessageWriter = function (roomUri) {
  return gArc.getFileWriteStream({
    filePath: `${appRoot}/archives/${roomUri}`,
    headers: ['room_id', 'room_uri', 'sent_at', 'from_userid', 'from_username', 'message_id', 'text'],
  });
};

var getErrorWriter = function (roomUri) {
  return gArc.getFileWriteStream({
    filePath: `${appRoot}/archives/${roomUri}.error`,
    headers: ['room_uri', 'room_id', 'before_id', 'skip', 'err_message'],
  });
};

gArc.fetchAllRoomMessagesAsync({
	roomId: '546fd572db8155e6700d6eaf' /* FreeCodeCamp/FreeCodeCamp */,
	groupId: '57542cf4c43b8c6019778297' /* FreeCodeCamp */,
	roomUri: 'FreeCodeCamp/FreeCodeCamp',
  beforeId: beforeId,
	get messageWriter() {
		return getMessageWriter(this.roomUri);
	},
	get errorWriter() {
		return getErrorWriter(this.roomUri);
	},
});