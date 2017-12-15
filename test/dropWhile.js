module.exports = function (test, TransformArrayLikeIterable) {
    const array = Object.freeze([1, 2, 3, 4, 5])

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
}
