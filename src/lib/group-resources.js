import appRoot from 'app-root-path';
import stampit from 'stampit';
import debug from 'debug';
import {env} from './app-config';

/* Debug Logs */
const logGroup = debug('gitter-archive:group');
const logGroupVerbose = debug('gitter-archive:group:verbose');

const GroupResources = stampit({
	methods: {
		/**
		 * All gitter group rooms.
		 * @param {any} {groupId}
		 * @description Get all rooms in given group id
		 * @returns {Promise}
		 */
		getAllRooms({groupId} = {}) {
			return this.request({
				url: `https://api.gitter.im/v1/groups/${groupId}/rooms`,
			})
			.then(response => ({
				rooms: response.data,
				groupId,
			}))
			.catch(err => ({
				error: err,
				groupId,
			}));
		},
		
		getAllGroups({isAdmin = false} = {}) {
			return this.request({
				url: 'https://api.gitter.im/v1/groups',
				query: {
					type: isAdmin ? 'admin' : undefined,
				},
			})
			.then(response => ({
				groups: response.data,
				isAdmin,
			}))
			.catch(err => ({
				error: err,
				isAdmin,
			}));
		},
	},
});

export {
	GroupResources,
};
