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

    findRepositories(basePath, isRecursive) {
        return new Promise((resolve, reject) => {
            let directoryNames;
            let repositories = [];

            this.isRepository(basePath).then((isRepository) => {
                if (isRepository) {
                    repositories.push(basePath);
                }

                if (!isRecursive) {
                    return resolve(repositories);
                }

                return this.listDirectories(basePath);
            }).then((directories) => {
                let promises = [];

                directoryNames = directories;

                directories.forEach((directory) => {
                    let directoryPath = path.join(basePath, directory);

                    promises.push(this.isRepository(directoryPath));
                });

                return Promise.all(promises);
            }).then((isRepository) => {
                directoryNames.forEach((directoryName, index) => {
                    let directoryPath = path.join(basePath, directoryName);

                    if (isRepository[index]) {
                        repositories.push(directoryPath);
                    }
                });

                return resolve(repositories);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    isRepository(repositoryPath) {
        return new Promise((resolve, reject) => {
            this.listDirectories(repositoryPath).then((directories) => {
                directories.forEach((directory) => {
                    if (directory === '.git') {
                        return resolve(true);
                    }
                });

                return resolve(false);
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
            fs.stat(directoryPath, (err, stats) => {
                if (err) {
                    return reject(err);
                }

                if (!stats.isDirectory()) {
                    return resolve([]);
                }

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

            let dateRange = this.buildDateRange(options.year, options.month, options.day);

            argv.push('--after="' + dateRange.after + '"');
            argv.push('--before="' + dateRange.before + '"');

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

    buildDateRange(year, month, day) {
        year = parseInt(year, 10);
        month = parseInt(month, 10) - 1;
        day = parseInt(day, 10);

        let afterDate;
        let beforeDate;

        if (isDefined(year) && isDefined(month) && isDefined(day)) {
            afterDate = new Date(year, month, day);
            beforeDate = new Date(year, month, day + 1);
        } else if (isDefined(year) && isDefined(month)) {
            afterDate = new Date(year, month, 1);
            beforeDate = new Date(year, month + 1, 0);
        } else if (isDefined(year)) {
            afterDate = new Date(year, 0);
            beforeDate = new Date(year + 1, 0);
        }

        return {
            after: afterDate.toISOString(),
            before: beforeDate.toISOString()
        };
    }

}

function pad(number) {
    if (number < 10) {
        return '0' + number;
    }

    return number;
}

function isDefined(number) {
    return number || number === 0;
}

function formatCommitDate(date) {
    return strftime('%c %z', date);
}

module.exports = new API();
