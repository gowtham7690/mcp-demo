const http = require('http');
const data = JSON.stringify({ id: '1', input: { op: 'add', a: 2, b: 3 } });

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/run',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      console.log('STATUS', res.statusCode);
      console.log('BODY', body);
    } catch (e) {
      console.error(e);
    }
  });
});

req.on('error', (err) => console.error('ERR', err.message));
req.write(data);
req.end();
