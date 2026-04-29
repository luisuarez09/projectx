const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/tools/seniat/lookup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', (e) => console.error(e));
req.write(JSON.stringify({ init: true }));
req.end();
