import axios from 'axios';

async function fetchStats() {
    const res = await axios.get('http://localhost:5000/api/analytics/hello');
    console.log(JSON.stringify(res.data, null, 2));
}

fetchStats();
