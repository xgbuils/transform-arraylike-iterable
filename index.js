const InmutableArray = require('array-inmutable')

const apply = (a, f) => f(a)
const matches = a => p => p(a)

const methods = {
    drop: slice,
    take: slice,
    slice,
    map () {
        return function (status) {
            return {
                value: this.data.reduce(apply, status.value)
            }
        }
    },
    filter () {
        return function (status) {
            return this.data.every(matches(status.value)) ? status : undefined
        }
    },
    dropWhile () {
        let indexDropping = 0
        return function (status) {
            const {array, length} = this.data
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
        return function (status) {
            return isTaking && this.data.every(matches(status.value))
                ? status
                : (isTaking = false, {done: true})
        }
    }
}

function slice () {
    let index = 0
    return function (status) {
        const start = this.data.start
        let result
        if (index >= start + this.data.length) {
            result = {done: true}
        } else if (index >= start) {
            result = status
        }
        ++index
        return result
    }
}

function TransformArrayLikeIterable (iterable) {
    this.iterable = iterable
    this.cs = new InmutableArray([])
}

function addTransform (fn) {
    return createIterable.call(this, this.type, this.data.push(fn), this.cs)
}

function dropTransform (n) {
    if (n <= 0) {
        return this
    }
    const data = this.data
    return createIterable.call(this, this.type, {
        start: data.start + n,
        length: data.length - n
    }, this.cs)
}

function takeTransform (n) {
    const data = this.data
    if (n >= data.length) {
        return this
    }
    return createIterable.call(this, this.type, {
        start: data.start,
        length: n
    }, this.cs)
}

function sliceTransform (start, end) {
    if (start <= 0) {
        return takeTransform.call(this, end)
    } else if (end >= this.data.length) {
        return dropTransform.call(this, start)
    }
    return createIterable.call(this, this.type, {
        start: this.data.start + start,
        length: end - start
    }, this.cs)
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
        length: Math.min(length, this.iterable.length - start)
    }
}

function methodGenerator (methodName, initialize, transform) {
    return function (...args) {
        let type = this.type
        let cs = this.cs
        if (type === methodName) {
            return transform.call(this, ...args)
        }
        const data = initialize.call(this, ...args)
        type = methodName
        if (this.type) {
            cs = cs.push({
                type: this.type,
                data: this.data
            })
        }
        return createIterable.call(this, type, data, cs)
    }
}

function createIterable (type, data, cs) {
    const obj = Object.create(this.constructor.prototype)
    obj.type = type
    obj.data = data
    obj.cs = cs
    obj.iterable = this.iterable
    return obj
}

function getFirst (obj) {
    const length = obj.cs.length
    return length === 0 ? obj : obj.cs.array[length - 1]
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
            const iterable = this.iterable
            let startStep = 0
            let startValue = 0
            let end = iterable.length
            const first = getFirst(this)
            if (first.type === 'slice') {
                startStep = 1
                startValue = first.data.start
                end = startValue + first.data.length
            }
            const list = cs.array.map(c => {
                return {
                    data: c.data,
                    fn: methods[c.type]()
                }
            })
            if (this.type) {
                list.push({
                    data: this.data,
                    fn: methods[this.type]()
                })
            }
            for (let i = startValue; i < end; ++i) {
                let status = {
                    value: iterable[i]
                }
                for (let j = startStep; j < list.length; ++j) {
                    status = list[j].fn(status)
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
