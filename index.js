console.log('App Start');

const willRunFromSource = () => /^prod/i.test(process.env.NODE_ENV) || /node(.exe|.cmd)?$/i.test(process.argv[0]);

if (willRunFromSource()) {
	console.log('Running from build');
	require('./build');
} else {
	console.log('Running from source');
	require('./src');
}