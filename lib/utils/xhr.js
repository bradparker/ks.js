function xhr(options) {
  var req = new XMLHttpRequest(),
      res;

  var resolve, reject;
  var promise = new Promise(function(res, rej) { 
    resolve = res; 
    reject  = rej;
  });
 
  req.open(options.method || 'GET', options.url, true);
 
  Object.keys(options.headers || {}).forEach(function (key) {
    req.setRequestHeader(key, options.headers[key]);
  });
 
  req.onreadystatechange = function() {
    if(req.readyState !== 4) {
      return;
    }
 
    if([200,304].indexOf(req.status) === -1) {
      reject(new Error('Server responded with a status of ' + req.status));
    } else {
      res = JSON.parse(req.responseText);
      resolve(res);
    }
  };
 
  req.send(options.data || void 0);
  
  return promise;
}

export default xhr;

