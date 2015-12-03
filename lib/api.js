'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const strftime = require('strftime');
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
            let directoryNames;

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
                argv.push('--date="' + formatCommitDate(options.date) + '"');
            }

            let filePath = path.join(
                options.directory,
                options.date.getFullYear().toString(),
                pad((options.date.getMonth() + 1).toString()),
                pad(options.date.getDate().toString())
            );

            mkdirp(path.dirname(filePath), (err) => {
                if (err) {
                    return reject(err);
                }

                let writer = fs.createWriteStream(filePath);

                let contents = Math.random().toString() + '\n';

                writer.write(contents, () => {
                    git.add(options.directory, filePath).then((added) => {
                        return git.commit(options.directory, 'This is a commit.', argv);
                    }).then((committed) => {
                        return resolve(true)
                    }).catch((err) => {
                        return reject(err);
                    });
                });
            });
        });
    }

    countCommits(options) {
        return new Promise((resolve, reject) => {
            this.getCommitDates(options).then((data) => {
                return resolve(data.dates.length);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    getCommitDates(options) {
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

            let commitDates = [];

            this.isRepositoryEmpty(options.directory).then((isEmpty) => {
                if (isEmpty) {
                    return resolve(null);
                }

                return git.log(options.directory, argv);
            }).then((stdout) => {
                let lines = stdout.split('\n');

                lines.forEach((line) => {
                    if (line.trim() === '') {
                        return;
                    }

                    commitDates.push(new Date(line));
                });

                return resolve({
                    repository: path.basename(options.directory),
                    dates: commitDates
                });
            }).catch((err) => {
                return reject(err);
            });
        });
    }

}

function pad(number) {
    if (number < 10) {
        return '0' + number;
    }

    return number;
}

function formatCommitDate(date) {
    return strftime('%c %z', date);
}

module.exports = new API();
