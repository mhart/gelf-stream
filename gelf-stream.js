var gelfStream = exports
var gelfling   = require('gelfling')
var map        = require('map-stream')

function create(host, port, options) {
  if (options == null && typeof port === 'object') {
    options = port
    port = null
    if (options == null && typeof host === 'object') {
      options = host
      host = null
    }
  }
  if (options == null) options = {}

  if (options.keepAlive == null) options.keepAlive = true

  var client = gelfling(host, port, options)
    , mapStream = map(function send(log, cb) {
        if (options.filter && !options.filter(log)) return cb()
        client.send(options.map ? options.map(log) : log, cb)
      })

  mapStream.on('end', function() { client.close() })

  return mapStream
}

// ---------------------------
// Bunyan stuff
// ---------------------------

function mapGelfLevel(bunyanLevel) {
  switch (bunyanLevel) {
    case 10 /*bunyan.TRACE*/: return gelfling.DEBUG
    case 20 /*bunyan.DEBUG*/: return gelfling.DEBUG
    case 30 /*bunyan.INFO*/:  return gelfling.INFO
    case 40 /*bunyan.WARN*/:  return gelfling.WARN
    case 50 /*bunyan.ERROR*/: return gelfling.ERROR
    case 60 /*bunyan.FATAL*/: return gelfling.EMERGENCY
    default:                  return gelfling.WARN
  }
}

function flatten(obj, into, prefix, sep) {
  if (into == null) into = {}
  if (prefix == null) prefix = ''
  if (sep == null) sep = '.'
  var key, prop
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) continue
    prop = obj[key]
    if (typeof prop === 'object' && !(prop instanceof Date) && !(prop instanceof RegExp))
      flatten(prop, into, prefix + key + sep, sep)
    else
      into[prefix + key] = prop
  }
  return into
}

function bunyanToGelf(log) {
  var errFile, key
    , ignoreFields = ['hostname', 'time', 'msg', 'name', 'level', 'v']
    , flattenedLog = flatten(log)
    , gelfMsg = {
        host:          log.hostname,
        timestamp:     +new Date(log.time) / 1000,
        short_message: log.msg,
        facility:      log.name,
        level:         mapGelfLevel(log.level),
        full_message:  JSON.stringify(log, null, 2)
      }

  if (log.err && log.err.stack &&
      (errFile = log.err.stack.match(/\n\s+at .+ \(([^:]+)\:([0-9]+)/)) != null) {
    if (errFile[1]) gelfMsg.file = errFile[1]
    if (errFile[2]) gelfMsg.line = errFile[2]
  }

  for (key in flattenedLog) {
    if (ignoreFields.indexOf(key) < 0 && gelfMsg[key] == null)
      gelfMsg[key] = flattenedLog[key]
  }

  return gelfMsg
}

function forBunyan(host, port, options) {
  if (options == null && typeof port === 'object') {
    options = port
    port = null
    if (options == null && typeof host === 'object') {
      options = host
      host = null
    }
  }
  if (options == null) options = {}
  
  options.map = bunyanToGelf

  return create(host, port, options)
}

gelfStream.create = create
gelfStream.forBunyan = forBunyan
gelfStream.bunyanToGelf = bunyanToGelf
gelfStream.mapGelfLevel = mapGelfLevel
gelfStream.flatten = flatten
