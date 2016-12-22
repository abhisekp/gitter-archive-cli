#!/usr/bin/env node

require('babel-polyfill');
require('source-map-support').install();

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

require('./cli');
