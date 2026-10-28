import http from 'http';

const TARGET = 'https://lrltahqxfwjfqnqddvp.supabase.co';
const PORT = process.env.PORT || 3000;

http.createServer(async (req, res) => {
  // تنظیم CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  try {
    const url = new URL(req.url, TARGET);
    
    // خواندن بدنه درخواست (برای لاگین که POST است)
    const body = req.method !== 'GET' && req.method !== 'HEAD' ? await new Promise((resolve) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
    }) : undefined;

    const headers = { ...req.headers };
    delete headers.host; // اجازه بده fetch خودش هاست را تنظیم کند

    // ارسال درخواست با fetch (مدیریت خودکار DNS و SNI)
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: body,
    });

    // انتقال پاسخ به مرورگر
    res.writeHead(response.status, Object.fromEntries(response.headers));
    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(error.message);
  }
}).listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
