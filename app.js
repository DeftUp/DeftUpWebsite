const http = require('http')

http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('This is the node js test!');
    console.log('app running on port 3000')
}).listen(3000);