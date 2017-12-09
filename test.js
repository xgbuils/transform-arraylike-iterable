const test = require('tape')
const tapSpec = require('tap-spec')

const TransformArrayLikeIterable = require('./')

const array = Object.freeze([1, 2, 3, 4, 5])
const string = 'abcd'
const double = e => e + e
const half = e => e / 2

test('constructor', function (t) {
    t.test('empty array', function (st) {
        const iterable = new TransformArrayLikeIterable([])
        st.deepEqual([...iterable], [],
            'must return an empty iterable')
        st.end()
    })
    t.test('non-empty array', function (st) {
        const iterable = new TransformArrayLikeIterable(array)
        st.deepEqual([...iterable], array,
            'must return an iterable with the same values')
        st.end()
    })

    t.test('empty string', function (st) {
        const iterable = new TransformArrayLikeIterable('')
        st.deepEqual([...iterable], [],
            'must return an empty iterable')
        st.end()
    })
    t.test('non-empty typed array', function (st) {
        const iterable = new TransformArrayLikeIterable(new Int8Array(array))
        st.deepEqual([...iterable], array,
            'must return an iterable with the same values')
        st.end()
    })
    t.end()
})

test('map', function (t) {
    t.test('empty array', function (st) {
        const iterable = new TransformArrayLikeIterable([]).map(double)
        st.deepEqual([...iterable], [],
            'must return an empty iterable')
        st.end()
    })
    t.test('non-empty string', function (st) {
        const iterable = new TransformArrayLikeIterable(string).map(double)
        const expected = [...string].map(double)
        st.deepEqual([...iterable], expected,
            'must return a new iterable with transformed values')
        st.end()
    })
    t.test('chaining', function (st) {
        const iterable = new TransformArrayLikeIterable(array)
            .map(double)
            .map(half)
        st.deepEqual([...iterable], array,
            'must be possible chain map method')
        st.end()
    })

    t.test('chaining composition rule', function (st) {
        const first = new TransformArrayLikeIterable(array)
            .map(double)
            .map(double)
        const second = new TransformArrayLikeIterable(array)
            .map(e => double(double(e)))
        st.deepEqual([...first], [...second],
            'composition rule for map must work')
        st.end()
    })

    t.test('using intermediate iterables', function (st) {
        const intermediate = new TransformArrayLikeIterable(array)
            .map(double)
        const first = intermediate.map(double)
        const second = intermediate.map(half)
        const firstExpected = array.map(double).map(double)
        const secondExpected = array.map(double).map(half)
        st.deepEqual([...first], firstExpected,
            'first result must be correct')
        st.deepEqual([...second], secondExpected,
            'second result must be correct')
        st.end()
    })
    t.end()
})

test('filter', function (t) {
    t.test('empty array', function (st) {
        const iterable = new TransformArrayLikeIterable([])
            .filter(() => true)
        st.deepEqual([...iterable], [],
            'must return an empty iterable')
        st.end()
    })
    t.test('filter some values', function (st) {
        const iterable = new TransformArrayLikeIterable(array)
            .filter(e => e % 2 === 0)
        const expected = array
            .filter(e => e % 2 === 0)
        st.deepEqual([...iterable], expected,
            'must filter the values that predicate returns true')
        st.end()
    })
    t.test('filter all', function (st) {
        const iterable = new TransformArrayLikeIterable(array)
            .filter(e => e <= 5)
        st.deepEqual([...iterable], array,
            'must filter all of values')
        st.end()
    })
    t.test('filter any', function (st) {
        const iterable = new TransformArrayLikeIterable(array)
            .filter(e => e > 5)
        st.deepEqual([...iterable], [],
            'must not filter any value')
        st.end()
    })
    t.test('chaining', function (st) {
        const iterable = new TransformArrayLikeIterable(array) // (1 2 3 4 5)
            .filter(e => e !== 3) // (1 2 4 5)
            .filter(e => e !== 4) // (1 2 5)
            .filter(e => e >= 2) // (2 5)
        st.deepEqual([...iterable], [2, 5],
            'must behave like Array#filter')
        st.end()
    })

    t.test('using intermediate iterables', function (st) {
        const intermediate = new TransformArrayLikeIterable(array)
            .filter(e => e !== 3) // (1 2 4 5)
        const first = intermediate
            .filter(e => e <= 4) // (1 2 4)
        const second = intermediate
            .filter(e => e > 2) // (4 5)
        st.deepEqual([...first], [1, 2, 4],
            'first result must be correct')
        st.deepEqual([...second], [4, 5],
            'second result must be correct')
        st.end()
    })
    t.end()
})

test('takeWhile', function (t) {
    t.test('empty array', function (st) {
        const iterable = new TransformArrayLikeIterable([])
            .takeWhile(() => true)
        st.deepEqual([...iterable], [],
            'must return an empty iterable')
        st.end()
    })
    t.test('takeWhile some values', function (st) {
        const iterable = new TransformArrayLikeIterable([2, 1, 5, 4, 3])
            .takeWhile(e => e % 2 === 0)
        const expected = [2]
        st.deepEqual([...iterable], expected,
            'must iterate over the values while the predicate returns true')
        st.end()
    })
    t.test('takeWhile all', function (st) {
        const otherArray = [2, 1, 5, 4, 3]
        const iterable = new TransformArrayLikeIterable(otherArray)
            .takeWhile(e => e <= 5)
        st.deepEqual([...iterable], otherArray,
            'must take all of values')
        st.end()
    })
    t.test('takeWhile any', function (st) {
        const iterable = new TransformArrayLikeIterable([2, 1, 5, 4, 3])
            .takeWhile(e => e > 5)
        st.deepEqual([...iterable], [],
            'must not takeWhile any value')
        st.end()
    })
    t.test('chaining', function (st) {
        const iterable = new TransformArrayLikeIterable(array) // (1 2 3 4 5)
            .takeWhile(e => e !== 5) // (1 2 3 4)
            .takeWhile(e => e !== 4) // (1 2 3)
            .takeWhile(e => e <= 2) // (1 2)
        st.deepEqual([...iterable], [1, 2],
            'must return the correct value')
        st.end()
    })

    t.test('using intermediate iterables', function (st) {
        const intermediate = new TransformArrayLikeIterable(array)
            .takeWhile(e => e !== 4) // (1 2 3)
        const first = intermediate
            .takeWhile(e => e <= 2) // (1 2)
        const second = intermediate
            .takeWhile(e => e % 2 !== 0) // (1)
        st.deepEqual([...first], [1, 2],
            'first result must be correct')
        st.deepEqual([...second], [1],
            'second result must be correct')
        st.end()
    })
    t.end()
})

test('dropWhile', function (t) {
    t.test('empty array', function (st) {
        const iterable = new TransformArrayLikeIterable([])
            .dropWhile(() => true)
        st.deepEqual([...iterable], [],
            'must return an empty iterable')
        st.end()
    })
    t.test('dropWhile some values', function (st) {
        const iterable = new TransformArrayLikeIterable([2, 1, 5, 4, 3])
            .dropWhile(e => e % 2 === 0)
        const expected = [1, 5, 4, 3]
        st.deepEqual([...iterable], expected,
            'must iterate over the values while the predicate returns true')
        st.end()
    })
    t.test('dropWhile all', function (st) {
        const iterable = new TransformArrayLikeIterable([2, 1, 5, 4, 3])
            .dropWhile(e => e <= 5)
        st.deepEqual([...iterable], [],
            'must take all of values')
        st.end()
    })
    t.test('dropWhile any', function (st) {
        const otherArray = [2, 1, 5, 4, 3]
        const iterable = new TransformArrayLikeIterable(otherArray)
            .dropWhile(e => e > 5)
        st.deepEqual([...iterable], otherArray,
            'must not dropWhile any value')
        st.end()
    })
    t.test('chaining', function (st) {
        const iterable = new TransformArrayLikeIterable(array) // (1 2 3 4 5)
            .dropWhile(e => e === 1) // (2 3 4 5)
            .dropWhile(e => e === 2) // (3 4 5)
            .dropWhile(e => e <= 2) // (3 4 5)
        st.deepEqual([...iterable], [3, 4, 5],
            'must return the correct value')
        st.end()
    })

    t.test('using intermediate iterables', function (st) {
        const intermediate = new TransformArrayLikeIterable(array)
            .dropWhile(e => e !== 3) // (3 4 5)
        const first = intermediate
            .dropWhile(e => e <= 2) // (3 4 5)
        const second = intermediate
            .dropWhile(e => e % 2 !== 0) // (4 5)
        st.deepEqual([...first], [3, 4, 5],
            'first result must be correct')
        st.deepEqual([...second], [4, 5],
            'second result must be correct')
        st.end()
    })
    t.end()
})

test('map & filter', function (t) {
    t.test('map, then filter', function (st) {
        const intermediate = new TransformArrayLikeIterable(array)
            .map(e => 2 * e) // (2 4 6 8 10)
        const first = intermediate
            .filter(e => e <= 6) // (2 4 6)
        const second = intermediate
            .filter(e => e > 4) // (6 8 10)
        st.deepEqual([...first], [2, 4, 6],
            'first result must be correct')
        st.deepEqual([...second], [6, 8, 10],
            'second result must be correct')
        st.end()
    })
    t.test('filter, then map', function (st) {
        const intermediate = new TransformArrayLikeIterable(array)
            .filter(e => e > 2) // (3 4 5)
        const first = intermediate
            .map(e => 2 * e) // (6 8 10)
        const second = intermediate
            .map(e => 3 * e) // (9 12 15)
        st.deepEqual([...first], [6, 8, 10],
            'first result must be correct')
        st.deepEqual([...second], [9, 12, 15],
            'second result must be correct')
        st.end()
    })
    t.end()
})

test('map & dropWhile', function (t) {
    t.test('dropWhile, then map, then dropWhile', function (st) {
        const iterable = new TransformArrayLikeIterable(array) // (1 2 3 4 5)
            .dropWhile(e => e < 2) // (2 3 4 5)
            .map(e => 2 * e) // (4 6 8 10)
            .dropWhile(e => e < 8) // (8 10)
        st.deepEqual([...iterable], [8, 10],
            'result must be correct')
        st.deepEqual([...iterable], [8, 10],
            'result must be correct when it iterates per second time')
        st.end()
    })
    t.end()
})

test('map & takeWhile', function (t) {
    t.test('takeWhile, then map, then takeWhile', function (st) {
        const iterable = new TransformArrayLikeIterable(array) // (1 2 3 4 5)
            .takeWhile(e => e < 4) // (1 2 3)
            .map(e => 2 * e) // (2 4 6)
            .takeWhile(e => e < 6) // (2 4)
        st.deepEqual([...iterable], [2, 4],
            'result must be correct')
        st.deepEqual([...iterable], [2, 4],
            'result must be correct when it iterates per second time')
        st.end()
    })
    t.end()
})

test.createStream()
    .pipe(tapSpec())
    .pipe(process.stdout)
