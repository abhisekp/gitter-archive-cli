import debug from 'debug';
import RateLimiterAPI from 'rate-limiter-api';
import axios from 'axios';
import promiseRetry from 'promise-retry';
import _ from 'lodash/fp';
import stampit from 'stampit';
// import {dedent} from 'dentist';
// import {logger} from './logger';

/* Debug Logs */
const logGitter = debug('gitter-archive:gitter');
const logGitterVerbose = debug('gitter-archive:gitter:verbose');

class EMISSINGURL extends Error {
	constructor(message) {
		super(`GITTER: ${message}`);
	}
}

const GitterClientFactory = stampit({
	// store client list in static property of the factory
	statics: {
		clientList: new Map(),
	},

	// store token in the client instance
	props: {
		token: '',
		rateLimiter: null,
	},

	// initiate with a token
	/**
	 * Initiate with a token
	 * @param  {string} token            Gitter authentication token
	 * @return {GitterClientFactory}     Gitter client instance
	 */
	init(token, {instance}) {
		if (!_.isString(token) || !token.length) {
			throw new Error('TOKEN is required.');
		}

		if (GitterClientFactory.clientList.has(token)) {
			return GitterClientFactory.clientList.get(token);
		}

		instance.token = token;
		instance.rateLimiter = RateLimiterAPI();

		GitterClientFactory.clientList.set(token, instance);
	},

	methods: {
		request({
			url /* url endpoint */,
			query = {} /* query param */,
			headers = {} /* extra headers */,
			method = 'GET' /* method type */,
		} = {}) {
			if (_.isNil(url)) {
				throw new EMISSINGURL('url is required');
			}

			// use standard required headers
			const __headers = _.defaults({
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.token}`,
			}, headers);
			logGitter('Headers:\n%o', __headers); // @DELETEME in production

			const taskFn = retry => this.rateLimiter.limit(responseHandler => {
				// modify the following according to the request library use
				axios[_.toLower(method)](url, {
					params: query,
					headers: __headers,
					timeout: 15e3 /* 15 seconds */,
				})
					.then(response => {
						const limits = {
							rateLimit: response.headers['x-ratelimit-limit'],
							rateRemaining: response.headers['x-ratelimit-remaining'],
							rateReset: response.headers['x-ratelimit-reset'],
						};
						logGitter(`Rate Limits:\n%o`, limits);

						// update rate limits
						this.rateLimiter.updateRateLimits(limits);

						logGitterVerbose('Response Body:\n%o', response);
						responseHandler(null, response);
					})
					.catch(err => {
						logGitter(`Request Error\n%o`, err);
						const response = err.response;
						console.error(`Rejected for ${err.stack}`);

						if (!response) {
							// throw err;
							return retry(err);
						}

						// @FIXME use winston
						console.dir(err, {colors: 1, depth: 0});

						const isClientError = response.clientError;
						logGitter('Is Client Error? %o', isClientError);

						responseHandler(err);
					});
			}).catch(err => {
				console.error(`Rejected for ${err.stack}`);

				if (_.get('response.clientError', err)) {
					throw err;
				}

				return retry(err);
			});

			return promiseRetry({
				retries: 3,
				maxTimeout: 60 * 60 * 1000, /* 1 hour */
			}, taskFn);
		}
	}
});

export {
	logGitter,
	logGitterVerbose,
	GitterClientFactory,
};
