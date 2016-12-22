import appRoot from 'app-root-path';
import _ from 'lodash/fp';
import {GitterClientFactory} from './gitter-client-factory';
import {RoomResources} from './room-resources';
import {GroupResources} from './group-resources';
import {gitterTokens} from './app-config';

// create gitter clients using token
const createGitterClient = GitterClientFactory.compose(RoomResources, GroupResources);

const getAllGitterClients = _.map(createGitterClient);

const gitterClients = getAllGitterClients(gitterTokens);

export {
	getAllGitterClients,
	gitterClients,
};
