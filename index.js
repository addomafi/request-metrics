const clone = require('stringify-clone');
const moment = require('moment')
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

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
                event.soapAction = m[1].replace('"', '');
            }
          }

          // If got an unsuccessful response, log it
          if ([200,202].indexOf(this.response.statusCode) < 0) {
            event.hasError = true;
            event.request = {
              headers    : clone(this.headers),
              body       : decoder.write(this.body)
            };

            event.responseFault = {
              headers    : clone(res.headers),
              statusCode : res.statusCode,
              body       : res.body
            };
          }

          console.info(`request-metrics-js\t${JSON.stringify(event)}`)
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
