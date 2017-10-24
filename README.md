# request-metrics

This Node.js module provides an easy way to get metrics from HTTP(S) requests performed
by the [`request` module](https://github.com/request/request)

## Usage

Basic usage is to require the module and call it, passing in the object
returned by `require('request')`:

```js
var request = require('request');

require('request-metrics-js')(request);
```
