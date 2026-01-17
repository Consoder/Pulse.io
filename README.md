<div align="center">

  <h1>⚡ PULSE.IO</h1>
  
  <h3>SCALE AT LIGHTSPEED.</h3>

  <p>
    <strong>A Cyberpunk-Aesthetic URL Shortener with God-Mode Analytics.</strong>
  </p>

  <a href="https://pulse-io-psi.vercel.app">
    <img src="https://img.shields.io/badge/LIVE_DEMO-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>

  <br />
  <br />

  ![License](https://img.shields.io/badge/license-MIT-cyan?style=flat-square)
  ![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
  ![Node](https://img.shields.io/badge/Node.js-v18-green?style=flat-square&logo=nodedotjs)
  ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-purple?style=flat-square&logo=tailwindcss)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Database-4ea94b?style=flat-square&logo=mongodb)

</div>

<br />

<div align="center">
  <img src="https://via.placeholder.com/1200x600/050505/06b6d4?text=PULSE.IO+MISSION+CONTROL" alt="Pulse Dashboard" width="100%" style="border-radius: 10px; border: 1px solid #333;" />
</div>

<br />

---

## 🚀 Mission Brief

**Pulse.io** isn't just another URL shortener. It is a **command center** for your links. Wrapped in a stunning, responsive **Cyberpunk/Glassmorphism UI**, it offers detailed insights into your traffic with a focus on speed, security, and aesthetics.

It features a "Mission Control" dashboard, password-protected "Classified" links, and real-time device fingerprinting.

---

## ✨ Key Features

### 🎨 **Next-Gen UI/UX**
* **Alive Interface:** Staggered scroll animations, hovering spotlight cards, and a custom magnetic cursor.
* **Graffiti CTA:** Unique, hand-drawn style animated indicators guiding user interaction.
* **Responsive Design:** Flawless experience across Desktop, Tablet, and Mobile (Mobile-first navigation).

### 📊 **God-Mode Analytics**
* **Bento Grid Layout:** Professional, structured data visualization.
* **Neon Charts:** Glowing Area and Pie charts powered by `Recharts` showing traffic trends.
* **Deep Tracking:** Captures **Geo-Location (City/Country)**, **OS**, **Device Type**, and **Browser**.
* **Live Feed:** Real-time visual feedback for link hits.

### 🛡️ **Iron-Clad Security**
* **Password Protection:** Create "Classified" gate-kept links that require an access key.
* **Google OAuth:** One-click secure sign-in/sign-up.
* **Data Encryption:** Sensitive data hashing using `bcrypt`.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose) |
| **Security** | JWT (JSON Web Tokens), Bcrypt, Helmet, CORS |
| **Tools** | `ua-parser-js` (Device Detection), `geoip-lite` (Location), EmailJS |

---

## ⚡ Setup Guide

Follow these instructions to deploy Pulse.io to your local command center.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/pulse-io.git](https://github.com/your-username/pulse-io.git)
cd pulse-io
2. Install Dependencies
Bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
3. Environment Variables
Create a .env file in the server folder:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
Create a .env file in the client folder:

Code snippet
VITE_GOOGLE_CLIENT_ID=your_google_client_id
4. Ignite Engines 🚀
Run the following in two separate terminals:

Bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
<div align="center">

Built with 💻 & ☕ by Kartik Bhargava

<sub>© 2026 Pulse.io Engineering. All Systems Operational.</sub>

</div>
