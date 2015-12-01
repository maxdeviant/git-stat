'use strict';

const exec = require('child_process').exec;

class Git {

    log(directory, argv) {
        return new Promise((resolve, reject) => {
            if (Array.isArray(argv)) {
                argv = argv.join(' ');
            }

            let child = exec('git log' + (argv ? ' ' + argv : ''), {
                cwd: directory || null
            }, (err, stdout, stderr) => {
                if (err) {
                    return reject(err);
                }

                return resolve(stdout);
            });
        });
    }

    shortlog(directory, argv) {
        return new Promise((resolve, reject) => {
            if (Array.isArray(argv)) {
                argv = argv.join(' ');
            }

            let child = exec('git shortlog' + (argv ? ' ' + argv : '') + ' < /dev/tty', {
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
