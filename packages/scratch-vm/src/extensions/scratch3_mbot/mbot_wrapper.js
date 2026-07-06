const MBotAPI = require('mbot-js-api');
const MBot_ROS = require('mbot_js');

class MBotWrapper {
    constructor(hostname) {
        this.lcmBot = new MBotAPI.MBot(hostname);
        this.rosBot = new MBot_ROS.MBot(hostname, 9090);
        this.activeBackend = null; // 'lcm' or 'ros'

        // Detect LCM Backend
        this.lcmBot.readHostname().then(() => {
            if (!this.activeBackend) {
                console.log('[MBotWrapper] LCM backend detected.');
                this.activeBackend = 'lcm';
                this._setupLCM();
            }
        }).catch(() => {});

        // Detect ROS Backend
        const checkRos = setInterval(() => {
            if (this.rosBot.connected) {
                if (!this.activeBackend) {
                    console.log('[MBotWrapper] ROS backend detected.');
                    this.activeBackend = 'ros';
                    this._setupROS();
                }
                clearInterval(checkRos);
            }
        }, 500);

        setTimeout(() => clearInterval(checkRos), 10000); // Stop checking after 10 seconds
    }

    // Mocking the connection checking for backwards compatibility
    readHostname() {
        if (this.activeBackend === 'lcm') {
            return this.lcmBot.readHostname();
        }
        return Promise.resolve("mbot-ros");
    }

    readChannels() {
        if (this.activeBackend === 'lcm') {
            return this.lcmBot.readChannels();
        }
        return Promise.resolve([]);
    }

    drive(vx, vy, wz) {
        if (this.activeBackend === 'lcm') {
            this.lcmBot.drive(vx, vy, wz);
        } else if (this.activeBackend === 'ros') {
            this.rosBot.publishCmdVel(vx, vy, wz);
        }
    }

    emergencyStop() {
        if (this.activeBackend === 'lcm') {
            this.lcmBot.publish({ "utime": Date.now() * 1000, "pwm": [0, 0, 0] }, "MBOT_MOTOR_PWM_CMD", "mbot_motor_pwm_t");
        } else if (this.activeBackend === 'ros') {
            this.rosBot.stop();
        }
    }

    resetSLAM() {
        if (this.activeBackend === 'lcm') {
            if (this.lcmBot.resetSLAM) this.lcmBot.resetSLAM();
        } else if (this.activeBackend === 'ros') {
            this.rosBot.resetSlam();
        }
    }

    onOdom(callback) {
        this.odomCallback = callback;
        if (this.activeBackend === 'lcm' && this.lcmOdomSetup) {
            this.lcmOdomSetup();
        }
    }

    onScan(callback) {
        this.scanCallback = callback;
        if (this.activeBackend === 'lcm' && this.lcmScanSetup) {
            this.lcmScanSetup();
        }
    }

    _setupLCM() {
        this.lcmOdomSetup = () => {
            this.lcmBot.subscribe(MBotAPI.config.ODOMETRY.channel, odom => {
                if (this.odomCallback) this.odomCallback(odom);
            }).catch(e => console.warn(`[MBotWrapper] Failed to subscribe to ${MBotAPI.config.ODOMETRY.channel}`, e));
        };
        if (this.odomCallback) this.lcmOdomSetup();
        
        this.lcmScanSetup = () => {
            this.lcmBot.subscribe(MBotAPI.config.LIDAR.channel, scan => {
                if (this.scanCallback) this.scanCallback(scan);
            }).catch(e => console.warn(`[MBotWrapper] Failed to subscribe to ${MBotAPI.config.LIDAR.channel}`, e));
        };
        if (this.scanCallback) this.lcmScanSetup();
    }

    _setupROS() {
        this.rosBot.readOdom(msg => {
            if (this.odomCallback) {
                this.odomCallback({
                    data: { x: msg.x, y: msg.y, theta: msg.theta }
                });
            }
        });
        this.rosBot.readScan(msg => {
            if (this.scanCallback) {
                const thetas = msg.ranges.map((_, i) => msg.angle_min + i * msg.angle_increment);
                this.scanCallback({
                    data: { ranges: msg.ranges, thetas: thetas }
                });
            }
        });
    }
}

module.exports = MBotWrapper;
