import path from 'path';
import _ from 'lodash/fp';
import debug from 'debug';
import cosmiconfig from 'cosmiconfig';
import appRoot from 'app-root-path';

require('dotenv').config({path: path.resolve(`${process.cwd()}/.env`)});

const pkgConfig = require(`${appRoot}/package.json`);

/* Debug Logs */
const logAppEnv = debug('gitter-archive:env');
const logAppEnvVerbose = debug('gitter-archive:env:verbose');
const logAppConfig = debug('gitter-archive:config');
const logAppConfigVerbose = debug('gitter-archive:config:verbose');

// environment vars
const {env} = process;
logAppEnvVerbose('ENV Vars:\n%o', env);

// app environment
const nodeEnv = _.toLower(_.get('NODE_ENV', env)) || 'development';
logAppEnv('set App Node ENV to %o', nodeEnv);

process.env.NODE_ENV = nodeEnv;
logAppEnv('set process.env.NODE_ENV to %o', process.env.NODE_ENV);

const {SRC_PATH} = env;
logAppEnv('process.env.SRC_PATH is set to %o', SRC_PATH);

const gitterTokens = _.flow(
	_.pickBy((_, key) => /^GITTER_?TOKEN/i.test(key)),
	_.values,
	_.uniq
)(env);

// environment status bools
const isProd = _.startsWith('prod', nodeEnv);
logAppConfig('set isProd to %o', isProd);

const isTest = _.startsWith('test', nodeEnv);
logAppConfig('set isTest to %o', isTest);

const isDev = _.startsWith('dev', nodeEnv);
logAppConfig('set isDev to %o', isDev);

// path of app based on environment
const srcPath = SRC_PATH || (isProd ? 'build' : 'src');
logAppConfig('set srcPath to %o', srcPath);

const appConfigAsync = cosmiconfig('gitterarchive');

/* App Configurations */
logAppConfigVerbose('App Configurations\n%o', appConfigAsync);

debug('App Config')('!! Module Loaded !!');

export {
	env,
	isProd,
	isTest,
	isDev,
	srcPath,
	appConfigAsync,
	gitterTokens,
	pkgConfig,
};
