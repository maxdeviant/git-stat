'use strict';

const should = require('should');
const api = require('../../lib/api');

describe('api', () => {
    describe('buildDateRange', () => {
        it('should build a date range for the specified day', () => {
            let afterDate = new Date(2016, 4, 16);
            let beforeDate = new Date(2016, 4, 17);

            let dateRange = api.buildDateRange(2016, 5, 16);

            (dateRange.after).should.be.exactly(afterDate.toISOString());
            (dateRange.before).should.be.exactly(beforeDate.toISOString());
        });

        it('should build a date range for the specified month', () => {
            let afterDate = new Date(2016, 4, 1);
            let beforeDate = new Date(2016, 4, 31);

            let dateRange = api.buildDateRange(2016, 5, null);

            (dateRange.after).should.be.exactly(afterDate.toISOString());
            (dateRange.before).should.be.exactly(beforeDate.toISOString());
        });

        it('should build a date range for the specified year', () => {
            let afterDate = new Date(2016, 0, 1);
            let beforeDate = new Date(2017, 0, 1);

            let dateRange = api.buildDateRange(2016, null, null);

            (dateRange.after).should.be.exactly(afterDate.toISOString());
            (dateRange.before).should.be.exactly(beforeDate.toISOString());
        });
    });
});
