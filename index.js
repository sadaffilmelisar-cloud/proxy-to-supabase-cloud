import http from 'http';
import https from 'https';
import dns from 'dns';

const TARGET = 'lrltahqxfwjfqnqddvp.supabase.co';
const PORT = process.env.PORT || 3000;

// 🔥 ساخت یک Resolver جدید و تنظیم DNSهای معروف
const resolver = new dns.Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);

const server = http.createServer(async (req, res) => {
  // تنظیم CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  try {
    // 🌟 پیدا کردن آی‌پی با استفاده از DNS سفارشی
    const ip = await new Promise((resolve, reject) => {
      resolver.resolve4(TARGET, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses[0]);
      });
    });

    const headers = { ...req.headers, host: TARGET };

    const options = {
      hostname: ip, // اتصال مستقیم به آی‌پی
      port: 443,
      path: req.url,
      method: req.method,
      headers: headers,
      servername: TARGET // بسیار مهم برای عبور از SNI
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
  } catch (error) {
    console.error("Resolution failed:", error);
    res.writeHead(500);
    res.end("Resolution failed: " + error.message);
  }
});

server.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
