'use strict';

const cli = require('commander');
const path = require('path');
const api = require('./api');

let repositoryPath;
let directoryPaths;

cli
    .version('1.0.0')
    .arguments('<repository> [directories...]')
    .action((repository, directories) => {
        repositoryPath = repository;

        if (directories && directories.length > 0) {
            directoryPaths = directories;
        } else {
            directoryPaths = ['.'];
        }
    })
    .option('-r, --recurse', 'Generate statistics recursively.')
    .option('-a, --author <author>', 'Get the commits by the specified author.')
    .option('-y, --year <year>', 'Get the commits for the specified year')
    .parse(process.argv);

let options = {};
let isRecursive = cli.recurse;

if (!repositoryPath) {
    console.log('Missing repository.');

    process.exit(1);
}

api.createRepository(repositoryPath).then((didCreateRepo) => {
    let promises = [];

    directoryPaths.forEach((directory) => {
        promises.push(api.findRepositories(directory, isRecursive));
    });

    return Promise.all(promises);
}).then((repositories) => {
    repositories = [].concat.apply([], repositories);

    let promises = repositories.map((repository) => {
        return api.getCommitDates({
            directory: repository,
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
}).then((success) => {
    if (!success) {
        throw 'Something went wrong.';
    }

    console.log('Success!');
}).catch((err) => {
    console.log(err);
});
