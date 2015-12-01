'use strict';

const _ = require('lodash');
const git = require('./git');

class API {

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

            git.log(options.directory, argv).then((stdout) => {
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
