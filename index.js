console.log('App Start');

const willRunFromSource = () => /^prod/i.test(process.env.NODE_ENV);

if (willRunFromSource()) {
	console.log('Running from build (lib)');
	module.exports = require('./lib');
} else {
	console.log('Running from source');
	module.exports = require('./src/lib');
}
