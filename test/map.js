module.exports = function (test, TransformArrayLikeIterable) {
    const array = Object.freeze([1, 2, 3, 4, 5])
    const string = 'abcd'
    const double = e => e + e
    const half = e => e / 2

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
}
