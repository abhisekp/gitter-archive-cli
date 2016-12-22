import path from 'path';
import _ from 'lodash/fp';
import appRoot from 'app-root-path';
import debug from 'debug';
import mkpath from 'mkpath';
import {store} from './config-store';
import {appConfigAsync} from './config-loader';
import {getArchiveRoomList} from './config-parser';

const log = debug('gitter-archive:runner');

const gArc = require(String(appRoot));

var getMessageWriter = function (roomUri) {
  return gArc.getFileWriteStream({
    filePath: `${process.cwd()}/archives/${roomUri}`,
    headers: ['room_id', 'room_uri', 'sent_at', 'from_userid', 'from_username', 'message_id', 'text'],
  });
};

var getErrorWriter = function (roomUri) {
  return gArc.getFileWriteStream({
    filePath: `${process.cwd()}/archives/${roomUri}.error`,
    headers: ['room_uri', 'room_id', 'before_id', 'skip', 'err_message'],
  });
};

const getRoomListAsync = async ({store, appConfig = {}, gitterClient}) => {
  const storeRooms = store.get('rooms');
  log('Got a list of rooms from store');

  if (!_.isEmpty(storeRooms)) {
    // only retrieve rooms which are not archived yet and should be archived
    const archivingRooms = _.filter({toArchive: true, isArchived: false}, storeRooms);
    gArc.logger.info('Got a list of rooms from store');
    return archivingRooms;
  }

  // get a list of groups from application config
  const {groups: {enabled: __enabledGroups = {}} = {}} = appConfig;
  log('Got list of rooms from user config');
  gArc.logger.info('Got list of rooms from user config as store was empty');
  
  // get the group list only if an id field is set
  const enabledgroups = _.flow(_.filter('id'), _.uniqBy('id'))(__enabledGroups);
  gArc.logger.info('Got list of groups from user config');

  // for each group fetch the list of rooms
  // @TODO async reducer
  /*
  const gitterRooms = _.reduce(
    (allRooms, group) => _.concat(allRooms, await gitterClient.getAllRooms({
      groupId: _.get('id', group),
    }).then(_.get('rooms'))),
    [], enabledgroups
  );
  */

  const gitterRooms = await gitterClient.getAllRooms({
    groupId: _.get('id', enabledgroups[0]),
  }).then(_.get('rooms'));
  gArc.logger.info('Fetched list of rooms from gitter for all groups');

  // get the rooms configuration from app config 
  // containing a list of archive and no archive room matchers
  // set `toArchive` to `true` for the rooms
  const {rooms: roomsConfig = {}} = appConfig;
  const parsedGitterRooms = _.flow(
    getArchiveRoomList(roomsConfig), 
    _.map(::store.parseRoom),
    _.map(_.set('toArchive', true)),
    _.sortBy('userCount'),
  )(gitterRooms);
  log('Parsed rooms from gitter in store format');
  gArc.logger.info('Parsed rooms from gitter in store format');

  return parsedGitterRooms;
};

const runAsync = async () => {
  try {
    // get the application configuration from the user set config file
    const appConfig = await appConfigAsync || {};

    // get room list from store
    const roomList = await getRoomListAsync({store, appConfig, gitterClient: gArc.gitterClients[0]});
    gArc.logger.info('Got a list of rooms to archive');

    // save the room list in store
    store.update('rooms', roomList);
    gArc.logger.info('Updated store with the new room list');

    // for each room in the room list, fetch the messages in the room
    _.forEach(roomInfo => {
      gArc.fetchAllRoomMessagesAsync({
        roomId: _.get('id', roomInfo),
        roomUri: _.get('uri', roomInfo),
        beforeId: _.get('beforeId', roomInfo),
        skip: _.get('skip', roomInfo),
        get messageWriter() {
          return getMessageWriter(this.roomUri);
        },
        get errorWriter() {
          return getErrorWriter(this.roomUri);
        },
        store,
      });
    }, roomList);
  } catch (err) {
    console.error(err);
    gArc.logger.close();
  }
};

export {
  runAsync,
};
