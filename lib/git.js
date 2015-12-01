'use strict';

const exec = require('child_process').exec;

class Git {
    shortlog(directory) {
        return new Promise((resolve, reject) => {
            let child = exec('git shortlog < /dev/tty', {
                cwd: directory || null
            }, (err, stdout, stderr) => {
                if (err) {
                    return reject(err);
                }

                return resolve(stdout);
            });
        });
    }
}

module.exports = new Git();
