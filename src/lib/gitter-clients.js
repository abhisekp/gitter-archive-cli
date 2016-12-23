import _ from 'lodash/fp';
import {GitterClientFactory} from './gitter-client-factory';
import {RoomResources} from './room-resources';
import {GroupResources} from './group-resources';
import {gitterTokens} from './app-config';

// create gitter clients using token
const createGitterClient = GitterClientFactory.compose(RoomResources, GroupResources);

const getAllGitterClients = _.map(createGitterClient);

const gitterClients = getAllGitterClients(gitterTokens);

const getNextGitterClient = (() => {
	let clientIdx = 0;

	return () => {
		const client = gitterClients[clientIdx];

		log(`currentClientIdx: ${clientIdx}`);
		const totalClients = _.size(gitterClients);
		clientIdx = cyclicNext(totalClients, clientIdx);

		return client;
	};
})();

export {
	getAllGitterClients,
	gitterClients,
	getNextGitterClient,
};
