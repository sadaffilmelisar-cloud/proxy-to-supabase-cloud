import http from 'http';
import https from 'https';

const TARGET = 'lrltahqxfwjfqnqddvp.supabase.co';
const PORT = process.env.PORT || 3000;

// 🔥 گرفتن آی‌پی از Cloudflare DoH (دور زدن مشکل DNS)
async function resolveIP() {
  const dohUrl = `https://cloudflare-dns.com/dns-query?name=${TARGET}&type=A`;
  const res = await fetch(dohUrl, {
    headers: { 'Accept': 'application/dns-json' }
  });
  const data = await res.json();
  const answers = data.Answer || [];
  const aRecord = answers.find(a => a.type === 1);
  if (!aRecord) throw new Error('No A record found');
  return aRecord.data;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  try {
    const ip = await resolveIP();
    console.log(`Resolved ${TARGET} to ${ip}`);

    const headers = { ...req.headers, host: TARGET };

    const options = {
      hostname: ip,
      port: 443,
      path: req.url,
      method: req.method,
      headers: headers,
      servername: TARGET
    };

    const proxyReq = https.request(options, (proxyRes) => {
      // حذف هدرهای فشرده‌سازی برای جلوگیری از خطای مرورگر
      const resHeaders = { ...proxyRes.headers };
      delete resHeaders['content-encoding'];
      delete resHeaders['transfer-encoding'];

      res.writeHead(proxyRes.statusCode, resHeaders);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500);
      res.end(err.message);
    });

    req.pipe(proxyReq);
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500);
    res.end(error.message);
  }
});

server.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
