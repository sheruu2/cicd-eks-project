const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('healthy');
    return;
  }
  res.writeHead(200);
  res.end('Hello from my app! Version 2.0 - CI/CD Pipeline is working!');
});
server.listen(3000, () => {
  console.log('Server running on port 3000');
});
