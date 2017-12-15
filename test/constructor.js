module.exports = function (test, TransformArrayLikeIterable) {
    const array = Object.freeze([1, 2, 3, 4, 5])

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
}
