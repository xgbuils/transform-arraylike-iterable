const InmutableArray = require('array-inmutable')

const apply = (a, f) => f(a)
const matches = a => p => p(a)

const methods = {
    map () {
        return (obj, status) => {
            return {
                value: obj.list.reduce(apply, status.value)
            }
        }
    },
    filter () {
        return (obj, status) => {
            return obj.list.every(matches(status.value)) ? status : undefined
        }
    },
    dropWhile () {
        let indexDropping = 0
        return (obj, status) => {
            const {array, length} = obj.list
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
            return isTaking && obj.list.every(matches(status.value))
                ? status
                : (isTaking = false, {done: true})
        }
    }
}

function TransformArrayLikeIterable (iterable) {
    this.iterable = iterable
    this.cs = []
    this.lastIndex = -1
}

function methodGenerator (methodName) {
    return function (f) {
        const obj = Object.create(this.constructor.prototype)
        const lastIndex = this.lastIndex
        const last = this.cs[lastIndex] || {}
        obj.cs = this.cs.map(({type, list}) => ({
            type,
            list
        }))
        obj.lastIndex = lastIndex
        if (last.type === methodName) {
            obj.cs[obj.lastIndex].list = last.list.push(f)
        } else {
            ++obj.lastIndex
            obj.cs.push({
                type: methodName,
                list: InmutableArray([f])
            })
        }
        obj.iterable = this.iterable
        return obj
    }
}

Object.defineProperties(TransformArrayLikeIterable.prototype, {
    map: {
        value: methodGenerator('map')
    },
    filter: {
        value: methodGenerator('filter')
    },
    dropWhile: {
        value: methodGenerator('dropWhile')
    },
    takeWhile: {
        value: methodGenerator('takeWhile')
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
