const express = require("express");
const cors = require("cors");
const net = require("net");
const aiRouter = require("./routes/ai");
require("dotenv").config();

const app = express();

// Smart port detection - tries multiple ports until one works
const findAvailablePort = (startPort = 3000) => {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      const server = net.createServer();
      
      server.listen(port, (err) => {
        if (err) {
          server.close();
          if (port < startPort + 100) { // Try up to 100 ports
            tryPort(port + 1);
          } else {
            reject(new Error('No available ports found'));
          }
        } else {
          server.close();
          resolve(port);
        }
      });
      
      server.on('error', () => {
        if (port < startPort + 100) {
          tryPort(port + 1);
        } else {
          reject(new Error('No available ports found'));
        }
      });
    };
    
    tryPort(startPort);
  });
};

// Universal IP detection that works on Mac, Windows, and Linux
const getAllLocalIPs = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal IPs, IPv6, and virtual interfaces
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({
          interface: name,
          ip: net.address,
          priority: getPriority(name, net.address)
        });
      }
    }
  }
  
  // Sort by priority (most likely to be the main network interface)
  ips.sort((a, b) => b.priority - a.priority);
  return ips;
};

// Prioritize network interfaces (higher = better)
const getPriority = (interfaceName, ip) => {
  let priority = 0;
  
  // Prefer common main interface names
  if (['en0', 'eth0', 'Wi-Fi', 'WiFi', 'Ethernet'].includes(interfaceName)) {
    priority += 100;
  }
  
  // Prefer 192.168.x.x networks (home/office)
  if (ip.startsWith('192.168.')) {
    priority += 50;
  }
  
  // Prefer 10.x.x.x networks (common corporate)
  if (ip.startsWith('10.')) {
    priority += 40;
  }
  
  // Avoid 169.254.x.x (auto-assigned, usually means no DHCP)
  if (ip.startsWith('169.254.')) {
    priority -= 50;
  }
  
  // Avoid virtual interfaces
  if (interfaceName.includes('bridge') || interfaceName.includes('utun') || 
      interfaceName.includes('awdl') || interfaceName.includes('anpi')) {
    priority -= 30;
  }
  
  return priority;
};

// Middleware
app.use(cors({
  origin: "*", // Allow all origins for development
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes
app.use("/api/ai", aiRouter);

// Test route - pretty HTML for humans, JSON for apps
app.get("/", (req, res) => {
  // Check if request is from a browser (has text/html in Accept header)
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  
  if (acceptsHtml) {
    const allIPs = getAllLocalIPs();
    const ipList = allIPs.map(ip => `<li><strong>${ip.interface}:</strong> ${ip.ip}</li>`).join('');
    
    // Return pretty HTML for browsers
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Motion API 🌊</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; background: linear-gradient(135deg, #f8f2d5, #f6dc9b); min-height: 100vh; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(60, 118, 96, 0.1); }
        h1 { color: #3c7660; margin-bottom: 10px; }
        .status { color: #4d987b; font-weight: 600; margin-bottom: 20px; }
        .endpoint { background: #f8f2d5; padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #f2cc6c; }
        .endpoint code { color: #3c7660; font-weight: 600; }
        .time { color: #999; font-size: 14px; margin-top: 20px; }
        .ip-list { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .ip-list h4 { margin-top: 0; color: #3c7660; }
        .ip-list ul { margin: 10px 0; padding-left: 20px; }
        .ip-list li { margin: 5px 0; }
        a { color: #4d987b; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌊 Motion API</h1>
        <div class="status">✅ API is running healthy!</div>
        
        <h3>Available Endpoints:</h3>
        <div class="endpoint">
          <strong>Health Check:</strong> <a href="/health"><code>GET /health</code></a>
        </div>
        <div class="endpoint">
          <strong>Generate Adventure:</strong> <code>POST /api/ai/generate-plan</code>
        </div>
        <div class="endpoint">
          <strong>Regenerate Step:</strong> <code>POST /api/ai/regenerate-step</code>
        </div>
        <div class="endpoint">
          <strong>AI Test:</strong> <a href="/api/ai/test"><code>GET /api/ai/test</code></a>
        </div>
        
        <div class="ip-list">
          <h4>📱 Mobile Access URLs:</h4>
          <ul>${ipList}</ul>
          <p><strong>💡 Use these IPs in your mobile app!</strong></p>
        </div>
        
        <div class="time">Started: ${new Date().toLocaleString()}</div>
      </div>
    </body>
    </html>`;
    res.send(html);
  } else {
    // Return JSON for API clients
    res.json({ 
      message: "Motion API is running! 🌊",
      status: "healthy",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "/health",
        generatePlan: "/api/ai/generate-plan", 
        regenerateStep: "/api/ai/regenerate-step",
        test: "/api/ai/test"
      }
    });
  }
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0"
  });
});

// Start server with dynamic port detection
const startServer = async () => {
  try {
    // Try preferred ports in order: 5000, 3001, 3000, then find any available
    const preferredPorts = [5000, 3001, 3000];
    let port;
    
    // First try preferred ports
    for (const preferredPort of preferredPorts) {
      try {
        port = await findAvailablePort(preferredPort);
        if (port === preferredPort) break; // Found our preferred port
      } catch (e) {
        continue; // Try next preferred port
      }
    }
    
    // If no preferred port available, find any available port starting from 3000
    if (!port) {
      port = await findAvailablePort(3000);
    }
    
    const allIPs = getAllLocalIPs();
    const primaryIP = allIPs[0]?.ip || 'localhost';
    
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Motion API successfully started!`);
      console.log(`📱 Local access: http://localhost:${port}`);
      console.log(`🌐 Primary mobile access: http://${primaryIP}:${port}`);
      console.log(`💚 Health check: http://localhost:${port}/health`);
      console.log(`🤖 AI test: http://localhost:${port}/api/ai/test`);
      console.log(`⚡ Port ${port} automatically selected`);
      console.log(`\n📍 All available IPs for mobile access:`);
      
      allIPs.forEach((ip, index) => {
        const prefix = index === 0 ? '🎯 PRIMARY' : '   ';
        console.log(`   ${prefix} ${ip.interface}: http://${ip.ip}:${port}`);
      });
      
      console.log(`\n💡 Copy one of these URLs to your mobile frontend!`);
      
      // Write comprehensive server info for frontend auto-detection
      const fs = require('fs');
      const serverInfo = {
        port,
        localUrl: `http://localhost:${port}`,
        localApiUrl: `http://localhost:${port}/api/ai`,
        primaryMobileUrl: `http://${primaryIP}:${port}`,
        primaryMobileApiUrl: `http://${primaryIP}:${port}/api/ai`,
        allMobileIPs: allIPs.map(ip => ({
          interface: ip.interface,
          ip: ip.ip,
          url: `http://${ip.ip}:${port}`,
          apiUrl: `http://${ip.ip}:${port}/api/ai`,
          priority: ip.priority
        })),
        timestamp: new Date().toISOString()
      };
      
      try {
        fs.writeFileSync('./server-info.json', JSON.stringify(serverInfo, null, 2));
        console.log(`📝 Server info written to ./server-info.json`);
      } catch (writeError) {
        console.log(`⚠️  Could not write server info file (this is okay)`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.log('💡 Try running: sudo lsof -i :5000 to see what\'s using port 5000');
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Motion API gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down Motion API gracefully...');
  process.exit(0);
});

// Start the server
startServer();