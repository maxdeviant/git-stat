'use strict';

const cli = require('commander');
const api = require('./api');

cli
    .version('1.0.0')
    .option('-p, --path [path]', 'Specify a path')
    .option('-r, --recurse', 'Generate statistics recursively')
    .parse(process.argv);

api.getCommits({
    author: 'Marshall'
}).then((count) => {
    console.log('Commits: ' + count);
}).catch((err) => {
    throw err;
});
