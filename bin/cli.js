#!/usr/bin/env node

var path = require('path');

var groupName = process.argv[2] || process.exit(1);
console.log('Group rooms to archive: ' + groupName);

var archiveDirPath = path.resolve(process.argv[3] || './archives');
console.log('Archive Path set to ' + archiveDirPath);
