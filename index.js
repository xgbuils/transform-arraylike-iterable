const InmutableArray = require('array-inmutable')

const apply = (a, f) => f(a)
const matches = a => p => p(a)

const methods = {
    drop: slice,
    take: slice,
    slice,
    map () {
        return (obj, status) => {
            return {
                value: obj.data.reduce(apply, status.value)
            }
        }
    },
    filter () {
        return (obj, status) => {
            return obj.data.every(matches(status.value)) ? status : undefined
        }
    },
    dropWhile () {
        let indexDropping = 0
        return (obj, status) => {
            const {array, length} = obj.data
            for (let i = indexDropping; i < length; ++i) {
                const f = array[i]
                if (f(status.value)) {
                    return
                }
                ++indexDropping
            }
            return status
        }
    },
    takeWhile () {
        let isTaking = true
        return (obj, status) => {
            return isTaking && obj.data.every(matches(status.value))
                ? status
                : (isTaking = false, {done: true})
        }
    }
}

function slice () {
    let index = 0
    return (obj, status) => {
        const start = obj.data.start
        const inRange = index >= start && index < start + obj.data.length
        ++index
        return inRange ? status : undefined
    }
}

function TransformArrayLikeIterable (iterable) {
    this.iterable = iterable
    this.cs = []
    this.lastIndex = -1
}

function addTransform (data, fn) {
    return data.push(fn)
}

function dropTransform (data, n) {
    if (n <= 0) {
        return data
    }
    return {
        start: data.start + n,
        length: data.length - n
    }
}

function takeTransform (data, n) {
    if (n >= data.length) {
        return data
    }
    return {
        start: data.start,
        length: n
    }
}

function sliceTransform (data, start, end) {
    if (start <= 0) {
        return takeTransform(data, end)
    } else if (end >= data.length) {
        return dropTransform(data, start)
    }
    return {
        start: data.start + start,
        length: end - start
    }
}

function initCallbackList (fn) {
    return InmutableArray([fn])
}

function initDrop (n) {
    const start = Math.max(n, 0)
    return {
        start,
        length: this.iterable.length - start
    }
}

function initTake (n) {
    const length = Math.max(n, 0)
    return {
        start: 0,
        length: Math.min(length, this.iterable.length)
    }
}

function initSlice (start, end) {
    start = Math.max(start, 0)
    const length = Math.max(end - start, 0)
    return {
        start,
        length: Math.min(length, this.iterable.length)
    }
}

function methodGenerator (methodName, initialize, transform) {
    return function (...args) {
        const obj = Object.create(this.constructor.prototype)
        const lastIndex = this.lastIndex
        const cs = this.cs.map(({type, data}) => ({
            type,
            data
        }))
        const last = cs[lastIndex] || {}
        obj.lastIndex = lastIndex
        if (last.type === methodName) {
            last.data = transform(last.data, ...args)
        } else {
            ++obj.lastIndex
            cs.push({
                type: methodName,
                data: initialize.call(this, ...args)
            })
        }
        obj.cs = cs
        obj.iterable = this.iterable
        return obj
    }
}

Object.defineProperties(TransformArrayLikeIterable.prototype, {
    drop: {
        value: methodGenerator('slice', initDrop, dropTransform)
    },
    take: {
        value: methodGenerator('slice', initTake, takeTransform)
    },
    slice: {
        value: methodGenerator('slice', initSlice, sliceTransform)
    },
    map: {
        value: methodGenerator('map', initCallbackList, addTransform)
    },
    filter: {
        value: methodGenerator('filter', initCallbackList, addTransform)
    },
    dropWhile: {
        value: methodGenerator('dropWhile', initCallbackList, addTransform)
    },
    takeWhile: {
        value: methodGenerator('takeWhile', initCallbackList, addTransform)
    },
    [Symbol.iterator]: {
        * value () {
            const cs = this.cs
            const callbacks = cs.map(c => methods[c.type]())
            const iterable = this.iterable
            const length = iterable.length
            for (let i = 0; i < length; ++i) {
                let status = {
                    value: iterable[i],
                    done: false
                }
                for (let j = 0; j < callbacks.length; ++j) {
                    status = callbacks[j](cs[j], status)
                    if (!status) {
                        break
                    } else if (status.done) {
                        return
                    }
                }
                if (status) {
                    yield status.value
                }
            }
        }
    }
})

module.exports = TransformArrayLikeIterable
