'use strict';

const _ = require('lodash');
const git = require('./git');

class API {

    countCommits(options) {
        return new Promise((resolve, reject) => {
            options = _.defaults(options, {
                author: null,
                year: null,
                month: null,
                day: null
            });

            git.shortlog(null, '-s -n').then((stdout) => {
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
