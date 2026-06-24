import localtunnel from 'localtunnel';
import fs from 'fs';

(async () => {
  const tunnel = await localtunnel({ port: 5000, subdomain: 'pulse-live-api-8912' });

  console.log("Tunnel URL:", tunnel.url);
  fs.writeFileSync('tunnel-url.txt', tunnel.url);

  tunnel.on('close', () => {
    console.log("Tunnel Closed");
  });
})();
