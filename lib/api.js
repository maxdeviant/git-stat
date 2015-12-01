'use strict';

const _ = require('lodash');
const git = require('./git');

class API {

    getCommits(options) {
        return new Promise((resolve, reject) => {
            options = _.defaults(options || {}, {
                directory: null,
                author: null,
                year: null,
                month: null,
                day: null
            });

            let argv = [];

            if (options.author) {
                argv.push('--author="' + options.author + '"');
            }

            git.log(options.directory, argv).then((stdout) => {
                let commits = [];

                console.log(stdout)
            }).catch((err) => {
                return reject(err);
            });
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
                '-s',
                '-n'
            ];

            git.shortlog(options.directory, argv).then((stdout) => {
                let total = 0;

                let lines = stdout.split('\n');

                for (let i in lines) {
                    let line = lines[i].replace(/[^0-9]/g, '');

                    let count = parseInt(line, 10);

                    if (count > 0) {
                        total += count;
                    }
                }

                return resolve(total);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

}

module.exports = new API();
