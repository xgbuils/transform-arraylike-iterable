module.exports = function (test, TransformArrayLikeIterable) {
    const array = Object.freeze([1, 2, 3, 4, 5])

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

    test('slice with map & filter', function (t) {
        t.test('slice, then map, then slice', function (st) {
            const iterable = new TransformArrayLikeIterable(array) // (1 2 3 4 5)
                .slice(1, 4) // (2 3 4)
                .map(e => 2 * e) // (4 6 8)
                .slice(1, 2) // (6)
            st.deepEqual([...iterable], [6],
                'result must be correct')
            st.deepEqual([...iterable], [6],
                'result must be correct when it iterates per second time')
            st.end()
        })
        t.test('slice, then filter, then slice', function (st) {
            const iterable = new TransformArrayLikeIterable(array) // (1 2 3 4 5)
                .slice(0, 4) // (1 2 3 4)
                .filter(e => e !== 2) // (1 3 4)
                .slice(1, 2) // (3)
            st.deepEqual([...iterable], [3],
                'result must be correct')
            st.deepEqual([...iterable], [3],
                'result must be correct when it iterates per second time')
            st.end()
        })
        t.end()
    })
}

