import dataStore from 'data-store';
import _ from 'lodash/fp';

const archiveStore = dataStore('gitterarchive-settings', {
  cwd: process.cwd()
});

const store = {
  save() {
    archiveStore.save();
  },

  update(key, value) {
    archiveStore.set(key, value);
  },

  /**
   * Alias of `update` method.
   * @alias 
   */
  get set() {
    return this.update;
  },

  get(key) {
    return archiveStore.get(key);
  },

  getRoom({id, uri}) {
    const rooms = this.get('rooms');
    const roomInfo = _.find({id}, rooms) || _.find({uri}, rooms);
    return roomInfo;
  },

  /**
   * Permanently store room setting.
   * @param {String} options.id - Unique ID of the room
   */
  setRoom({id, uri} = {}, key, value) {
    const roomInfo = this.getRoom({id, uri});

    roomInfo[key] = value;
    this.save();
  },

  /**
   * Alias of `setRoom` method.
   * @alias 
   */
  get updateRoom() {
    return this.setRoom;
  },

  /**
   * Room Info Format
   * {uri, id, isArchived, toArchive, toDelete, isDeleted, beforeId, skip}
   **/
  parseRoom(roomInfo) {
    // @TODO parse roomInfo got from gitter to store format
    const __formattedRoomInfo = _.pickAll(['uri', 'id', 'userCount', 'public'], roomInfo);
    const formattedRoomInfo = _.assign({
      toArchive: false,
      isArchived: false,
      toDelete: false,
      isDeleted: false,
      beforeId: undefined,
      messageCount: 0,
      skip: 0,
    }, __formattedRoomInfo);

    return formattedRoomInfo;
  }
}

store.save();

export {
  store,
};
