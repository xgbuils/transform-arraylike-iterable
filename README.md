# functor-filter-arraylike-iterable

[![travis ci][1]][2]
[![npm version][3]][4]
[![Coverage Status][5]][6]
[![Dependency Status][7]][8]

`functor-filter-arraylike-iterable` exports a class that builds iterables that provide map method.

## Install

``` bash
$ npm install functor-filter-arraylike-iterable --save
```

## Usage
``` JavaScript
const FunctorFilterArrayLikeIterable = require('functor-filter-arraylike-iterable')

const iterable = new FunctorFilterArrayLikeIterable([4, 2, 7, 8]) // (4 2 7 8)
    .map(e => 3 * e) // (12 6 21 24)
    .filter(e => e % 4 !== 1) // (12 6 24)



// converting to array:
[...iterable] // [12, 6, 24]

// traversing values:
for (const val of iterable) {
    // ...
}

// creating an iterator that traverses the values
let iterator = iterable[Symbol.iterator]()
iterator.next() // {value: 12, done: false}
iterator.next() // {value: 6, done: false}
iterator.next() // {value: 24, done: false}
iterator.next() // {value: undefined, done: true}
```

## Support
- Node.js >=6
- ES2015 transpilers

## License
MIT

  [1]: https://travis-ci.org/xgbuils/functor-filter-arraylike-iterable.svg?branch=master
  [2]: https://travis-ci.org/xgbuils/functor-filter-arraylike-iterable
  [3]: https://badge.fury.io/js/functor-filter-arraylike-iterable.svg
  [4]: https://badge.fury.io/js/functor-filter-arraylike-iterable
  [5]: https://coveralls.io/repos/github/xgbuils/functor-filter-arraylike-iterable/badge.svg?branch=master
  [6]: https://coveralls.io/github/xgbuils/functor-filter-arraylike-iterable?branch=master
  [7]: https://david-dm.org/xgbuils/functor-filter-arraylike-iterable.svg
  [8]: https://david-dm.org/xgbuils/functor-filter-arraylike-iterable
