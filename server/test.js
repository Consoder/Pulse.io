import { execSync } from 'child_process';

async function runTest() {
    try {
        console.log("Generating dummy link...");
        const res = await fetch('http://127.0.0.1:5000/api/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://github.com/loadtest', userId: 'loadtester' })
        });
        const data = await res.json();
        const shortCode = data.shortCode;
        console.log("Created short code:", shortCode);
        
        console.log("Running Autocannon load test on the redirect endpoint...");
        execSync(`autocannon -c 50 -d 15 http://127.0.0.1:5000/${shortCode}`, { stdio: 'inherit' });
    } catch (err) {
        console.error("Test failed:", err);
    }
}

runTest();
