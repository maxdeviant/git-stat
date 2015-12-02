'use strict';

const cli = require('commander');
const path = require('path');
const api = require('./api');

cli
    .version('1.0.0')
    .option('-d, --directory <directory>', 'Specify a directory')
    .option('-o, --output <directory>', 'Output directory')
    .option('-r, --recurse', 'Generate statistics recursively')
    .option('-a, --author <author>', 'Get the commits by the specified author.')
    .option('-y, --year <year>', 'Get the commits for the specified year')
    .parse(process.argv);

let options = {};

if (cli.directory) {
    options.directory = cli.directory;
}

let repositoryPath = cli.output;
let isRecursive = cli.recurse;

api.createRepository(repositoryPath).then((didCreateRepo) => {
    let directories = [];

    return api.findRepositories(options.directory);
}).then((repositories) => {
    let promises = repositories.map((repository) => {
        return api.getCommitDates({
            directory: path.join(options.directory, repository),
            year: cli.year,
            author: cli.author
        });
    });

    return Promise.all(promises);
}).then((data) => {
    let entries = [];

    data.forEach((entry, index) => {
        if (!entry) {
            return;
        }

        entry.dates.forEach((date) => {
            entries.push({
                directory: repositoryPath,
                date: date
            });
        });
    });

    let lastPromise = entries.reduce((promise, entry) => {
        return promise.then((result) => {
            return api.createCommit(entry);
        });
    }, Promise.resolve());

    return lastPromise;
}).then((results) => {
    console.log(results);
}).catch((err) => {
    console.log(err);
});
