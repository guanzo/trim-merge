var chai = require('chai')
chai.should()
var { parseTime, parseTimespan } = require('../src/parser')

describe('parseTime()', () => {
    it('correctly parses times', () => {
        let time = "03"
        parseTime(time).should.equal("00:00:03")
        time = "03:03"
        parseTime(time).should.equal("00:03:03")
        time = "00:00:03"
        parseTime(time).should.equal("00:00:03")
        time = "3"
        parseTime(time).should.equal("00:00:03")
    })
})

describe('parseTimespan()', () => {
    let test1 = {
        input: "00:00:10-00:00:15",
        output: {
            start: "00:00:10",
            duration: 5
        }
    }
    let test2 = {
        input: "00:15-00:25",
        output: {
            start: "00:00:15",
            duration: 10
        }
    }
    let test3 = {
        input: "10-25",
        output: {
            start: "00:00:10",
            duration: 15
        }
    }
    let testNoTimespan = {
        input: "",
        output: {}
    }
    let testLast = {
        input: "00:00:10",
        output: {
            start: "00:00:10"
        }
    }
    it('correctly parses "HH:mm:ss-HH:mm:ss" timespans', () => {
        parseTimespan(test1.input).should.deep.equal(test1.output)
    })
    it('correctly parses "mm:ss-mm:ss" timespans', () => {
        parseTimespan(test2.input).should.deep.equal(test2.output)
    })
    it('correctly parses "ss-ss" timespans', () => {
        parseTimespan(test3.input).should.deep.equal(test3.output)
    })
    it('returns an empty object when no timespan is given', () => {
        parseTimespan(testNoTimespan.input).should.deep.equal(testNoTimespan.output)
    })
    it('does not return duration when end time is not given', () => {
        parseTimespan(testLast.input).should.deep.equal(testLast.output)
    })
})