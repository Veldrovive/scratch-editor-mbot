const WebSocket = require('ws');
global.WebSocket = WebSocket;

const MBotAPI = require('mbot-js-api');

const mbotIP = process.argv[2] || 'localhost';
console.log(`Connecting to MBot at ${mbotIP}...`);

const mbot = new MBotAPI.MBot(mbotIP);

// Test if we are online (can read hostname)
mbot.readHostname().then(hostname => {
    console.log(`✅ Successfully connected. Hostname: ${hostname}`);
}).catch(e => {
    console.error(`❌ Failed to connect or read hostname:`, e);
});

// Test reading channels to ensure API is responsive
mbot.readChannels().then(channels => {
    console.log(`✅ Successfully read channels:`, channels.join(', '));
}).catch(e => {
    console.error(`❌ Failed to read channels:`, e);
});

let odometryCount = 0;
let lidarCount = 0;

console.log(`Subscribing to Odometry (${MBotAPI.config.ODOMETRY.channel}) and Lidar (${MBotAPI.config.LIDAR.channel})...`);

mbot.subscribe(MBotAPI.config.ODOMETRY.channel, (odom) => {
    odometryCount++;
    if (odometryCount === 1) {
        console.log(`✅ Received first odometry message! (x: ${odom.data.x.toFixed(3)}, y: ${odom.data.y.toFixed(3)}, theta: ${odom.data.theta.toFixed(3)})`);
    }
}).catch(e => console.error(`❌ Failed to subscribe to odometry:`, e));

mbot.subscribe(MBotAPI.config.LIDAR.channel, (scan) => {
    lidarCount++;
    if (lidarCount === 1) {
        console.log(`✅ Received first LIDAR scan! (${scan.data.ranges.length} rays)`);
    }
}).catch(e => console.error(`❌ Failed to subscribe to LIDAR:`, e));

console.log(`Sending a test drive command (vx=0, vy=0, wz=0)...`);
try {
    mbot.drive(0, 0, 0);
    console.log(`✅ Drive command sent successfully.`);
} catch (e) {
    console.error(`❌ Failed to send drive command:`, e);
}

// Keep the script running for a few seconds to receive messages
setTimeout(() => {
    console.log(`\n--- Summary ---`);
    console.log(`Odometry messages received: ${odometryCount}`);
    console.log(`LIDAR messages received: ${lidarCount}`);
    if (odometryCount === 0) console.warn(`⚠️ Warning: No odometry data received.`);
    if (lidarCount === 0) console.warn(`⚠️ Warning: No LIDAR data received.`);
    
    console.log('Exiting test script.');
    process.exit(0);
}, 3000);
