import http from 'http';
import https from 'https';

const TARGET = 'lrltahqxfwjfqnqddvp.supabase.co';
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // تنظیم CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // انتقال درخواست به Supabase
  const options = {
    hostname: TARGET,
    port: 443,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.writeHead(500);
    res.end(err.message);
  });

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
