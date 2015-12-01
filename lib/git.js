'use strict';

const exec = require('child_process').exec;

class Git {

    init(directory) {
        return new Promise((resolve, reject) => {
            let child = exec('git init', {
                cwd: directory || null
            }, (err, stdout, stderr) => {
                if (err) {
                    return reject(err);
                }

                return resolve(true);
            });
        });
    }

    add(directory, glob, argv) {
        return new Promise((resolve, reject) => {
            if (Array.isArray(argv)) {
                argv = argv.join(' ');
            }

            let child = exec('git add ' + glob + (argv ? ' ' + argv : ''), {
                cwd: directory || null
            }, (err, stdout, stderr) => {
                if (err) {
                    return reject(err);
                }

                console.log(stdout);

                return resolve(true);
            });
        });
    }

    commit(directory, message, argv) {
        return new Promise((resolve, reject) => {
            if (Array.isArray(argv)) {
                argv = argv.join(' ');
            }

            let child = exec('git commit -m' + message + (argv ? ' ' + argv : ''), {
                cwd: directory || null
            }, (err, stdout, stderr) => {
                if (err) {
                    return reject(err);
                }

                console.log(stdout);

                return resolve(true);
            });
        });
    }

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
