import winston from 'winston';
import {Papertrail} from 'winston-papertrail';
import {env} from './app-config';

const {PAPERTRAIL_HOST = '', PAPERTRAIL_PORT = ''} = env;

const ptLogger = new Papertrail({
	host: PAPERTRAIL_HOST,
	port: PAPERTRAIL_PORT,
	hostname: 'gitter-archive',
	level: 'info',
	colorize: true,
});

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
	transports: [ptLogger, consoleLogger],
});

ptLogger.on('error', ::logger.info);
ptLogger.on('connect', ::logger.info);

export {logger};
