import stampit from 'stampit';
import debug from 'debug';
import _ from 'lodash/fp';

/* Debug Logs */
const logRoom = debug('gitter-archive:room');
const logRoomVerbose = debug('gitter-archive:room:verbose');

class EGITTERROOM extends Error {
	constructor(message) {
		super(`GITTER:ROOM ${message}`);
	}
}

const RoomResources = stampit({
	methods: {
		/**
		 * roomId - room id of the room.
		 * beforeId - get messages from before this message id.
		 * skip - skip over number of messages and get 100 messages.
		 *
		 * @name getChatMessages
		 * @argument option
		 * @description Get chat messages of a given room id.
		 * @param {roomId, beforeId, skip}
		 * @version 1.0.0
		 * @since 1.0.0
		 * @see https://developer.gitter.im/docs/messages-resource
		 */
		getChatMessages({roomId, beforeId, skip = 0, lean = true, ...restparam} = {}) {
			logRoom('Room Id is set to %o', roomId);
			logRoom('Before Id is set to %o', beforeId);
			logRoom('Skip is set to %o', skip);

			// if no room id given, then throw
			if (!_.isString(roomId)) {
				throw new EGITTERROOM('A valid `roomId` is required.');
			}

			return this.request({
				url: `https://api.gitter.im/v1/rooms/${roomId}/chatMessages`,
				query: {
					skip,
					beforeId,
					limit: 100,
					lean,
				},
			})
			.then(response => ({
				messages: response.data,
				roomId,
				beforeId,
				skip,
				...restparam,
			}))
			.catch(err => ({
				error: err,
				roomId,
				beforeId,
				skip,
				...restparam,
			}));
		},
	},
});

export {
	logRoom,
	logRoomVerbose,
	RoomResources,
	EGITTERROOM,
};
