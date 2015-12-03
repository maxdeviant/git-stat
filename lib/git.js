'use strict';

const exec = require('child_process').exec;
const ExecLimiter = require('exec-limiter');

class Git {

    constructor() {
        this.limiter = new ExecLimiter(500);
    }

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
            argv = argv || [];

            this.limiter.add('git', ['add', glob].concat(argv), {
                cwd: directory || null
            }, (err) => {
                if (err) {
                    return reject(err);
                }

                return resolve(true);
            });
        });
    }

    commit(directory, message, argv) {
        return new Promise((resolve, reject) => {
            argv = argv || [];

            this.limiter.add('git', ['commit', '-m', message].concat(argv), {
                cwd: directory || null
            }, (err) => {
                if (err) {
                    return reject(err);
                }

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

    showRef(directory) {
        return new Promise((resolve, reject) => {
            let child = exec('git show-ref', {
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
