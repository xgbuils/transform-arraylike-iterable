module.exports = function (test, TransformArrayLikeIterable) {
    const array = Object.freeze([1, 2, 3, 4, 5, 6])
    const string = 'abcd'

    test('slice', function (t) {
        t.test('empty array', function (st) {
            const iterable = new TransformArrayLikeIterable([]).drop(5)
            st.deepEqual([...iterable], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('negative drop', function (st) {
            const iterable = new TransformArrayLikeIterable(string).drop(-2)
            st.deepEqual([...iterable], [...string],
                'must be equivalent to dropping 0 elements')
            st.end()
        })
        t.test('drop more elements than iterable has', function (st) {
            const iterable = new TransformArrayLikeIterable(array).drop(8)
            st.deepEqual([...iterable], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('drop the same elements as iterable has', function (st) {
            const iterable = new TransformArrayLikeIterable(array).drop(array.length)
            st.deepEqual([...iterable], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('drop some elements', function (st) {
            const iterable = new TransformArrayLikeIterable(array).drop(2)
            st.deepEqual([...iterable], array.slice(2),
                'must behave like array slice')
            st.end()
        })
        t.test('chaining', function (st) {
            const iterable = new TransformArrayLikeIterable(array) // (1 2 3 4 5 6)
                .drop(1) // (2 3 4 5 6)
                .drop(2) // (4 5 6)
                .drop(1) // (5 6)
            const expected = array
                .slice(1)
                .slice(2)
                .slice(1)
            st.deepEqual([...iterable], expected,
                'must behave like slice with positive starts and ends')
            st.end()
        })

        t.test('using intermediate iterables', function (st) {
            const intermediate = new TransformArrayLikeIterable(array)
                .drop(2) // (3 4 5 6)
            const first = intermediate.drop(1) // (4 5 6)
            const second = intermediate.drop(3) // (6)
            const firstExpected = array.slice(2).slice(1)
            const secondExpected = array.slice(2).slice(3)
            st.deepEqual([...first], firstExpected,
                'first result must be correct')
            st.deepEqual([...second], secondExpected,
                'second result must be correct')
            st.end()
        })
        t.end()
    })
}
