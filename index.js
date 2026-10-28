import http from 'http';
import https from 'https';

const TARGET = 'lrltahqxfwjfqnqddvp.supabase.co';
const PORT = process.env.PORT || 3000;

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
    // 🔥 این بخش جدید: پیدا کردن آی‌پی از طریق DNS گوگل برای دور زدن مشکل Render
    const dohUrl = `https://dns.google/resolve?name=${TARGET}&type=A`;
    const dohRes = await fetch(dohUrl);
    const dohData = await dohRes.json();
    
    const answers = dohData.Answer ? dohData.Answer.filter(a => a.type === 1) : [];
    if (answers.length === 0) throw new Error("Could not resolve IP");
    const ip = answers[0].data;

    const headers = { ...req.headers, host: TARGET };

    const options = {
      hostname: ip, // اتصال مستقیم به آی‌پی
      port: 443,
      path: req.url,
      method: req.method,
      headers: headers,
      servername: TARGET // تنظیم SNI برای عبور از Cloudflare
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
