var localtunnel = require('localtunnel');

localtunnel(5000, { subdomain: "dkadsdionsod" }, function(err, tunnel) {
  console.log('LT running')
});