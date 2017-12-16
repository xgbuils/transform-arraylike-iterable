const TransformArraylikeIterable = require('../')

const test = require('tape')
const tapSpec = require('tap-spec')

const constructor = require('./constructor')
const drop = require('./drop')
const dropWhile = require('./dropWhile')
const filter = require('./filter')
const map = require('./map')
const slice = require('./slice')
const take = require('./take')
const takeWhile = require('./takeWhile')

const methodMixtures = require('./methodMixtures')

const testSuites = [
    constructor,
    drop,
    dropWhile,
    filter,
    map,
    slice,
    take,
    takeWhile,
    methodMixtures
]

testSuites.forEach(fn => fn(test, TransformArraylikeIterable))

test.createStream()
    .pipe(tapSpec())
    .pipe(process.stdout)
