'use strict';

const cli = require('commander');
const git = require('./git');

cli
    .version('1.0.0')
    .option('-p, --path [path]', 'Specify a path')
    .option('-r, --recurse', 'Generate statistics recursively')
    .parse(process.argv);

git.shortlog().then((stdout) => {
    console.log(stdout);
}).catch((err) => {
    throw err;
});
