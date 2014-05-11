/* Import node's http module: */
var http = require("http");
var handleRequest = require("../server/request-handler").handleRequest;
var url = require("url");
// Refactored out for ORM
//var persistentServer = require('../SQL/persistent_server');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('chat', 'root', '');
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  // Previously in handleRequest function...
  "Content-Type": "JSON/application"
};
var sequelizedMessages = sequelize.define('sequelizedMessages', {
  messageID: {type: Sequelize.INTEGER, autoincrement: true},
  username: Sequelize.STRING,
  text: Sequelize.TEXT,
  roomname: Sequelize.STRING,
  createdAt: Sequelize.DATE
});
//persistentServer.dbConnection.connect();

/* Every server needs to listen on a port with a unique number. The
 * standard port for HTTP servers is port 80, but that port is
 * normally already claimed by another server and/or not accessible
 * so we'll use a higher port number that is not likely to be taken: */
var port = 3000;

/* For now, since you're running this server on your local machine,
 * we'll have it listen on the IP address 127.0.0.1, which is a
 * special address that always refers to localhost. */
var ip = "127.0.0.1";



/* We use node's http module to create a server. Note, we called it 'server', but
we could have called it anything (myServer, blahblah, etc.). The function we pass it (handleRequest)
will, unsurprisingly, handle all incoming requests. (ps: 'handleRequest' is in the 'request-handler' file).
Lastly, we tell the server we made to listen on the given port and IP. */
/*var options = {
  key: fs.readFile("classes/messages"),
  cert: fs.readFile("classes/messages")
};*/

var router = {
  '/messages': handleRequest
};


var server = http.createServer(function(request, response){
  var path = url.parse(request.url, true);
  if(router[path.pathname]){
    router[path.pathname](request, response, sequelizedMessages, path.query.order); // handleRequest()
  } else {
    response.writeHead(404, defaultCorsHeaders);
    response.end('404');
  }
});
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);

/* To start this server, run:
     node basic-server.js
 *  on the command line.

 * To connect to the server, load http://127.0.0.1:8080 in your web
 * browser.

 * server.listen() will continue running as long as there is the
 * possibility of serving more requests. To stop your server, hit
 * Ctrl-C on the command line. */
