'use strict';

const cli = require('commander');
const api = require('./api');

cli
    .version('1.0.0')
    .option('-d, --directory <directory>', 'Specify a directory')
    .option('-r, --recurse', 'Generate statistics recursively')
    .option('-y, --year <year>', 'Get the commits for the specified year')
    .parse(process.argv);

let options = {};

if (cli.directory) {
    options.directory = cli.directory;
}

if (cli.year) {
    options.year = cli.year;
}

api.countCommits(options).then((count) => {
    console.log('Commits: ' + count);
}).catch((err) => {
    throw err;
});
