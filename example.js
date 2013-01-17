var split = require('split')
  , bunyan = require('bunyan')
  , gelfStream = require('./') // require('gelf-stream')

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

