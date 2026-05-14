const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = true; // Always true for development
const app = next({ dev, hostname: 'localhost', port: 3000 });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Custom Server Ready on http://localhost:3000');
    console.log('> To stop, press Ctrl+C');
    
    // Prevent the process from exiting gracefully automatically
    setInterval(() => {}, 1000 << 30);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
