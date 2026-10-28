import http from 'http';
import https from 'https';

const TARGET = 'lrltahqxfwjfqnqddvp.supabase.co';
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // 🌟 این خط جادویی: جایگزینی هدر Host با آدرس Supabase
  const headers = { ...req.headers, host: TARGET };

  const options = {
    hostname: TARGET,
    port: 443,
    path: req.url,
    method: req.method,
    headers: headers
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(err);
    res.writeHead(500);
    res.end(err.message);
  });

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
