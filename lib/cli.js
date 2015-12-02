'use strict';

const cli = require('commander');
const path = require('path');
const api = require('./api');

cli
    .version('1.0.0')
    .option('-d, --directory <directory>', 'Specify a directory')
    .option('-o, --output <directory>', 'Output directory')
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

let repositoryPath = cli.output;
let isRecursive = cli.recurse;

api.createRepository(repositoryPath).then((didCreateRepo) => {
    let directories = [];

    return api.findRepositories(options.directory);
}).then((repositories) => {
    let promises = repositories.map((repository) => {
        return api.countCommits({
            directory: path.join(options.directory, repository)
        });
    });

    return Promise.all(promises);
}).then((commits) => {
    console.log(commits)
}).catch((err) => {
    console.log(err);
});
