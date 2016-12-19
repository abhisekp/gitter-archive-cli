import appRoot from 'app-root-path';
import _ from 'lodash/fp';
import {GitterClientFactory} from './gitter-client-factory';
import {RoomResources} from './room-resources';

const {gitterTokens} = require(`${appRoot}/config/app-config`);

// create gitter clients using token
const createGitterClient = GitterClientFactory.compose(RoomResources);

const getAllGitterClients = _.map(createGitterClient);

const gitterClients = getAllGitterClients(gitterTokens);

export {
	getAllGitterClients,
	gitterClients,
};