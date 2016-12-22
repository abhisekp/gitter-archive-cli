import _ from 'lodash/fp';
import extglob from 'extglob';

const wildMatch = _.curryN(2, (pattern, string) => extglob.isMatch(_.toLower(string), _.toLower(pattern)));

/*
  Filter the `array` based on list of `matchers` using the `iteratee` function
  union of `iteratee(pattern, array)` for each `pattern` in `matchers`
*/
const filterByWildMatchers = _.curryN(3, 
  (iteratee, matchers, array) => _.reduce(
    (list, currMatcher) => _.union(list, iteratee(currMatcher, array)), 
    [], matchers
  )
);

const wildMatchUri = _.curryN(2, (pattern, obj) => wildMatch(pattern, _.get('uri', obj)));

const filterByUriWildMatch = _.curryN(2, (pattern, array) => _.filter(wildMatchUri(pattern), array));

/**
 * @param {Array} roomList - List of rooms to select from.
 * @param {Object} roomsConfig - rooms config
 */
const getArchiveRoomList = _.curryN(2, (roomsConfig = {}, roomList) => {
  const {
    archiveList: archiveListMatchers = [],
    noArchiveList: noArchiveListMatchers = [],
  } = roomsConfig;

  const archiveList = filterByWildMatchers(filterByUriWildMatch, archiveListMatchers, roomList);

  const noArchiveList = filterByWildMatchers(filterByUriWildMatch, noArchiveListMatchers, roomList);

  const finalList = _.differenceBy('uri', archiveList, noArchiveList);

  return finalList;
});

export {
  getArchiveRoomList,
};
