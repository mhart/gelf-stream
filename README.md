gelf-stream
-----------

[![Build Status](https://secure.travis-ci.org/mhart/gelf-stream.png?branch=master)](http://travis-ci.org/mhart/gelf-stream)

A node.js stream to send JS objects to a Graylog2 server (in GELF format).

Also provides a stream that can be used directly in
[Bunyan](https://github.com/trentm/node-bunyan) and provides
a number of sane mappings.

Example
-------

```javascript
var split = require('split')
  , bunyan = require('bunyan')
  , gelfStream = require('gelf-stream')

// gelf-stream comes with Bunyan support

var stream = gelfStream.createBunyan('localhost')

var log = bunyan.createLogger({name: 'foo', streams: [{type: 'raw', stream: stream}]})

log.info('Testing Bunyan')

stream.end()

// Or you can use it to stream any sort of object/string

process.stdin
  .pipe(split()) // split into lines
  .pipe(gelfStream.create('localhost', {defaults: {level: 6}}))

process.stdin.resume()
```

API
---

### gelfStream.create([host], [port], [options])

### gelfStream.createBunyan([host], [port], [options])


Installation
------------

With [npm](http://npmjs.org/) do:

```
npm install gelf-stream
```

