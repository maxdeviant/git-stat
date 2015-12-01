'use strict';

const exec = require('child_process').exec;

class Git {

    shortlog(directory, argv) {
        return new Promise((resolve, reject) => {
            let child = exec('git shortlog ' + argv + ' < /dev/tty', {
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
