import http from 'http';
import https from 'https';

const TARGET_HOST = 'lrltahqxfwjfqnqddvp.supabase.co';
// استفاده از آی‌پی شناخته‌شده Cloudflare برای Supabase (دور زدن مشکل DNS)
const TARGET_IP = '104.18.38.104'; 
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

  const headers = { ...req.headers, host: TARGET_HOST };

  const options = {
    hostname: TARGET_IP,
    port: 443,
    path: req.url,
    method: req.method,
    headers: headers,
    servername: TARGET_HOST // بسیار مهم برای عبور از SNI
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
