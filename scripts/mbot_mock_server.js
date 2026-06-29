const WebSocket = require('ws');

const port = 5005;
const wss = new WebSocket.Server({ port });

console.log(`Mock MBot Server listening on ws://localhost:${port}`);

let odometry = { x: 0, y: 0, theta: 0 };
let velocities = { vx: 0, vy: 0, wz: 0 };

// Update odometry based on current velocities to simulate movement
setInterval(() => {
    odometry.x += velocities.vx * 0.1;
    odometry.y += velocities.vy * 0.1;
    odometry.theta += velocities.wz * 0.1;
}, 100);

wss.on('connection', function connection(ws) {
    console.log("Client connected");
    
    let subscriptions = new Set();
    
    ws.on('message', function incoming(message) {
        try {
            const msg = JSON.parse(message);
            console.log('Received:', message.toString());
            
            if (msg.type === 'request') {
                if (msg.channel === 'HOSTNAME') {
                    ws.send(JSON.stringify({
                        type: 'response',
                        channel: 'HOSTNAME',
                        data: 'mbot-mock-server'
                    }));
                } else if (msg.channel === 'CHANNELS') {
                    ws.send(JSON.stringify({
                        type: 'response',
                        channel: 'CHANNELS',
                        data: ['HOSTNAME', 'CHANNELS', 'MBOT_ODOMETRY', 'LIDAR', 'MBOT_VEL_CMD']
                    }));
                }
            } else if (msg.type === 'subscribe') {
                subscriptions.add(msg.channel);
                console.log("Client subscribed to:", msg.channel);
                
                // The client expects at least one message on subscribe to resolve the promise.
                if (msg.channel === 'MBOT_ODOMETRY') {
                    ws.send(JSON.stringify({
                        type: 'publish',
                        channel: 'MBOT_ODOMETRY',
                        data: odometry
                    }));
                } else if (msg.channel === 'LIDAR') {
                    // Send dummy LIDAR data
                    const ranges = new Array(360).fill(1.5);
                    const thetas = new Array(360).fill(0).map((_, i) => i * Math.PI / 180);
                    ws.send(JSON.stringify({
                        type: 'publish',
                        channel: 'LIDAR',
                        data: { ranges, thetas }
                    }));
                }
            } else if (msg.type === 'publish') {
                if (msg.channel === 'MBOT_VEL_CMD') {
                    velocities.vx = msg.data.vx || 0;
                    velocities.vy = msg.data.vy || 0;
                    velocities.wz = msg.data.wz || 0;
                    console.log('Updated velocities:', velocities);
                }
            }
        } catch (e) {
            console.error("Error parsing message", e);
        }
    });
    
    // Periodic publishers for subscriptions
    const odomInterval = setInterval(() => {
        if (subscriptions.has('MBOT_ODOMETRY')) {
            ws.send(JSON.stringify({
                type: 'publish',
                channel: 'MBOT_ODOMETRY',
                data: odometry
            }));
        }
    }, 100);

    const lidarInterval = setInterval(() => {
        if (subscriptions.has('LIDAR')) {
            const ranges = new Array(360).fill(1.5);
            const thetas = new Array(360).fill(0).map((_, i) => i * Math.PI / 180);
            ws.send(JSON.stringify({
                type: 'publish',
                channel: 'LIDAR',
                data: { ranges, thetas }
            }));
        }
    }, 500);

    ws.on('close', () => {
        clearInterval(odomInterval);
        clearInterval(lidarInterval);
        console.log("Client disconnected");
    });
});
