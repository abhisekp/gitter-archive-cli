import winston from 'winston';
import _ from 'lodash/fp';
import {Papertrail} from 'winston-papertrail';
import {env} from './app-config';

const {PAPERTRAIL_HOST = '', PAPERTRAIL_PORT = ''} = env;

const getPapertrailLogger = (host, port) => {
	if (_.isEmpty(host) || _.isEmpty(port)) {
		return undefined;
	}

	const ptLogger = new Papertrail({
		host,
		port,
		hostname: 'gitter-archive',
		level: 'info',
		colorize: true,
	});

	return ptLogger;
}

const ptLogger = getPapertrailLogger(PAPERTRAIL_HOST, PAPERTRAIL_PORT);

const consoleLogger = new winston.transports.Console({
	colorize: true,
	level: 'error',
});

const logger = new winston.Logger({
	levels: {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
	},
	transports: _.compact([ptLogger, consoleLogger]),
});

if (_.isObject(ptLogger)) {
	ptLogger.on('error', ::logger.info);
	ptLogger.on('connect', ::logger.info);
}

export {logger};
