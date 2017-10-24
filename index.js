var clone = require('stringify-clone');
let moment = require('moment')

module.exports = exports = function(request, log) {
  log = log || exports.log

  var proto
  if (request.Request) {
    proto = request.Request.prototype
  } else {
    throw new Error(
      "Pass the object returned by require('request') to this function.")
  }

  if (!proto._initBeforeMetrics) {
    proto._initBeforeMetrics = proto.init

    proto.init = function() {
      this.on('request', function(req) {
        this.startedAt = moment()
      }).on('complete', function(res, body) {
        if (this.callback) {
          // Event details
          var event = {
            uri: this.path,
            duration: moment().diff(this.startedAt) // Calculate the total spend time
          };

          // Get Soap Action ID
          if (this.headers["SOAPAction"]) {
            const regex = /([^\\\/?#]+)/g;
            let m;
            while ((m = regex.exec(this.headers["SOAPAction"])) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                event.soapAction = m[1];
            }
          }

          console.info(event)
          // If got an unsuccessful response, log it
          if ([200,202].indexOf(this.response.statusCode) < 0) {
            log('responseFault', {
              headers    : clone(res.headers),
              statusCode : res.statusCode,
              body       : res.body
            }, this)
          }
        }
      })

      return proto._initBeforeMetrics.apply(this, arguments)
    }
  }
}

exports.log = function(type, data, r) {
  var toLog = {}
  toLog[type] = data
  console.error(toLog)
}
