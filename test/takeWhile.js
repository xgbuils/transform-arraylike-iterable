module.exports = function (test, TransformArrayLikeIterable) {
    const array = Object.freeze([1, 2, 3, 4, 5])

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
}
