import { spawn } from 'child_process';
import fs from 'fs';

const child = spawn('npx.cmd', ['-y', 'cloudflared', 'tunnel', '--url', 'http://localhost:5173'], { shell: true });

child.stderr.on('data', (data) => {
    const str = data.toString();
    const match = str.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match) {
        console.log("Frontend Tunnel URL:", match[0]);
        fs.writeFileSync('frontend-tunnel-url.txt', match[0]);
    }
});

child.stdout.on('data', (data) => console.log(data.toString()));
child.on('close', (code) => console.log(`Cloudflared exited with code ${code}`));
