var messages = [{
  username: 'elmo',
  text: 'elmo loves you',
  roomname: 'sesame street',
  messageId: 0,
  createdAt: -1
}];

var messageId = 0;
var queryTypes = {
  '-createdAt': function(messages) {
    messages.sort(function(message1, message2) {
      var date1 = Date.parse(message1.createdAt);
      var date2 = Date.parse(message2.createdAt);

      return date2 - date1;
    });
  }
};

exports.handleRequest = function(request, response, query) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */
  console.log("Serving request type " + request.method + " for url " + request.url);
  var statusCodes = {
    GET: 200,
    POST: 201,
    OPTIONS: 200
  };
  var httpRequest = {
    GET: get,
    POST: post,
    OPTIONS: options
  };

  /* .writeHead() tells our server what HTTP status code to send back */
  response.writeHead(statusCodes[request.method], defaultCorsHeaders);

  var res = httpRequest[request.method](request,response, query);

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
  response.end(JSON.stringify(res));
};

var post = function(request, response) {
  var data = '';
  request.on('data', function(partialData){
    data += partialData;
  });
  request.on('end', function(){
    var message = JSON.parse(data);
    message.messageId = ++messageId;
    message.createdAt = new Date();
    messages.push(message);
    return {messageId: message.messageId};
  });
};

var get = function(request, response, query) {
  if (query) {
    queryTypes[query](messages);
  }
  var res = {'results': messages};
  return res;
};

var options = function(request, response){
  return '';
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  // Previously in handleRequest function...
  "Content-Type": "JSON/application"
};
