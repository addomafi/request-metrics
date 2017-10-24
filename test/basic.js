var engine  = require('detect-engine'),
  lib     = require('./lib'),
  assert   = require('assert'),
  request = require('request'),
  should  = require('should')

describe('request-metrics', function() {
  var proto = request.Request.prototype

  before(function() {
    lib.enableMetrics(request)
    lib.startServers()

    request = request.defaults({
      headers : {
        host : 'localhost',
        'Content-Type': 'text/xml;charset=UTF-8'
      },
      rejectUnauthorized : false
    })
  })

  it('should capture a normal soap request', function(done) {
    request.post({
      url: lib.urls.http + '/soap',
      headers: {
        'SOAPAction': '"http://www.johndoe.com/Walker"'
      },
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
               <soapenv:Header/>
               <soapenv:Body>
                  <Null/>
               </soapenv:Body>
            </soapenv:Envelope>`
    }, function(err, res, body) {
      should.not.exist(err)
      should.exist(this.startedAt)
      done()
    })
  })


})
