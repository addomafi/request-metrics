var engine         = require('detect-engine'),
  express        = require('express'),
  http           = require('http'),
  mocha          = require('mocha'),
  should         = require('should'),
  util           = require('util')

var app,
  ports = {
    http  : 8480,
    https : 8443
  }

exports.ports    = ports
exports.requests = []
exports.urls     = {}

for (var proto in ports) {
  exports.urls[proto] = util.format(
    '%s://localhost:%d',
    proto,
    ports[proto])
}

exports.enableMetrics = function(request) {
  // enable debugging
  require('../..')(request)
}

exports.startServers = function() {
  app = express()

  function handleRequest(req, res) {
    res.send('Request OK')
  }

  app.post('/soap', handleRequest)

  http.createServer(app).listen(ports.http)
}
