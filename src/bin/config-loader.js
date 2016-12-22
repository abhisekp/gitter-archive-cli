import cosmiconfig from 'cosmiconfig';
import _ from 'lodash/fp';

const appConfigAsync = cosmiconfig('gitterarchive', {
  rcExtensions: true,
}).load(process.cwd()).then(_.get('config'));

export {
  appConfigAsync,
};
