'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const git = require('./git');

class API {

    createRepository(repositoryPath) {
        return new Promise((resolve, reject) => {
            mkdirp(repositoryPath, (err) => {
                if (err) {
                    return reject(err);
                }

                git.init(repositoryPath).then((isSuccessful) => {
                    return resolve(isSuccessful);
                }).catch((err) => {
                    return reject(err);
                });
            });
        });
    }

    findRepositories(basePath) {
        return new Promise((resolve, reject) => {
            var directoryNames;

            this.listDirectories(basePath).then((directories) => {
                let promises = [];

                directoryNames = directories;

                directories.forEach((directory) => {
                    let directoryPath = path.join(basePath, directory);

                    promises.push(this.listDirectories(directoryPath));
                });

                return Promise.all(promises);
            }).then((subdirectories) => {
                let repositories = [];

                directoryNames.forEach((directory, index) => {
                    if (subdirectories[index].indexOf('.git') !== -1) {
                        repositories.push(directory);
                    }
                });

                return resolve(repositories);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    isRepositoryEmpty(repositoryPath) {
        return new Promise((resolve, reject) => {
            git.showRef(repositoryPath).then((stdout) => {
                return resolve(false);
            }).catch((err) => {
                return resolve(true);
            });
        });
    }

    listDirectories(directoryPath) {
        return new Promise((resolve, reject) => {
            fs.readdir(directoryPath, (err, files) => {
                if (err) {
                    return reject(err);
                }

                let promises = [];

                files.forEach((file) => {
                    let filePath = path.join(directoryPath, file);

                    let promise = new Promise((resolve, reject) => {
                        fs.stat(filePath, (err, stats) => {
                            if (err) {
                                return reject(err);
                            }

                            return resolve(stats);
                        });
                    });

                    promises.push(promise);
                });

                Promise.all(promises).then((stats) => {
                    let directories = [];

                    files.forEach((file, index) => {
                        if (stats[index].isDirectory()) {
                            directories.push(file);
                        }
                    });

                    return resolve(directories);
                }).catch((err) => {
                    return reject(err);
                });
            });
        });
    }

    createCommit(options) {
        return new Promise((resolve, reject) => {
            options = _.defaults(options || {}, {
                directory: null,
                message: null,
                date: null
            });

            let argv = [];

            if (options.date) {
                argv.push('--date="' + options.date.toISOString() + '"');
            }

            fs.writeFile()
        });
    }

    countCommits(options) {
        return new Promise((resolve, reject) => {
            options = _.defaults(options || {}, {
                directory: null,
                author: null,
                year: null,
                month: null,
                day: null
            });

            let argv = [
                '--format="%ci"'
            ];

            if (options.author) {
                argv.push('--author="' + options.author + '"');
            }

            if (options.year) {
                let year = parseInt(options.year, 10);

                argv.push('--after="' + new Date(year, 0).toISOString() + '"');
                argv.push('--before="' + new Date(year + 1, 0).toISOString() + '"');
            }

            this.isRepositoryEmpty(options.directory).then((isEmpty) => {
                if (isEmpty) {
                    return resolve(0);
                }

                return git.log(options.directory, argv);
            }).then((stdout) => {
                let lines = stdout.split('\n');

                let commitCount = lines.length - 1;

                return resolve(commitCount);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

}

module.exports = new API();
