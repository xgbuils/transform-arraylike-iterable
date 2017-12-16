module.exports = function (test, TransformArrayLikeIterable) {
    const array = Object.freeze([1, 2, 3, 4, 5, 6])
    const string = 'abcd'

    test('slice', function (t) {
        t.test('empty array', function (st) {
            const iterable = new TransformArrayLikeIterable([]).take(2)
            st.deepEqual([...iterable], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('negative take', function (st) {
            const iterable = new TransformArrayLikeIterable(string).take(-2)
            st.deepEqual([...iterable], [],
                'must be equivalent to taking 0 elements')
            st.end()
        })
        t.test('take more elements than iterable has', function (st) {
            const iterable = new TransformArrayLikeIterable(array).take(8)
            st.deepEqual([...iterable], array,
                'must return the same iterable')
            st.end()
        })
        t.test('take the same elements as iterable has', function (st) {
            const iterable = new TransformArrayLikeIterable(array).take(array.length)
            st.deepEqual([...iterable], array,
                'must return the same iterable')
            st.end()
        })
        t.test('take some elements', function (st) {
            const iterable = new TransformArrayLikeIterable(array).take(2)
            st.deepEqual([...iterable], array.slice(0, 2),
                'must behave like array slice')
            st.end()
        })
        t.test('chaining', function (st) {
            const iterable = new TransformArrayLikeIterable(array) // (1 2 3 4 5 6)
                .take(5) // (2 3 4 5 6)
                .take(3) // (4 5 6)
                .take(4) // (4 5 6)
            const expected = array
                .slice(0, 5)
                .slice(0, 3)
                .slice(0, 4)
            st.deepEqual([...iterable], expected,
                'must behave like slice with positive starts and ends')
            st.end()
        })

        t.test('using intermediate iterables', function (st) {
            const intermediate = new TransformArrayLikeIterable(array)
                .take(4) // (1 2 3 4)
            const first = intermediate.take(2) // (1 2)
            const second = intermediate.take(3) // (1 2 3)
            const firstExpected = array.slice(0, 4).slice(0, 2)
            const secondExpected = array.slice(0, 4).slice(0, 3)
            st.deepEqual([...first], firstExpected,
                'first result must be correct')
            st.deepEqual([...second], secondExpected,
                'second result must be correct')
            st.end()
        })
        t.end()
    })
}
