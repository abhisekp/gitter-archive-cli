console.log('App Start');

const willRunFromBuild = () => /^prod/i.test(process.env.NODE_ENV);

if (willRunFromBuild()) {
	console.log('Running from build (lib)');
	module.exports = require('./lib');
} else {
	console.log('Running from source');
	module.exports = require('./src/lib');
}
