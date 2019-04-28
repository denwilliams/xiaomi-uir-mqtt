const miio = require("miio");
const mqttusvc = require("mqtt-usvc");
const queue = require("queue");

const service = mqttusvc.create();
const { host, token } = service.config.gateway;
let q, device, destroyPromise;

service.on("message", (topic, data) => {
  if (topic === "learn") {
    addToQueue(learnCommand());
  }
  if (topic === "send") {
    addToQueue(sendCommand(data));
  }
});

service.subscribe("learn");
service.subscribe("send");

function learnCommand() {
  return async function() {
    console.log("Learning...");
    const code = await learn();
    service.send("learned", code);
    console.log("Learned", code);
  };
}

function sendCommand(code) {
  return async function() {
    console.log("Sending", code);
    await send(code);
  };
}

async function addToQueue(fn) {
  if (q) {
    q.push(fn);
    return;
  }

  if (destroyPromise) {
    await destroyPromise;
    destroyPromise = undefined;
  }

  q = queue({ concurrency: 1 });
  q.push(connectDevice);
  q.push(fn);
  q.start(err => {
    destroyPromise = device.destroy();
    q = undefined;
  });
}

async function connectDevice() {
  try {
    // console.log("Connect", host, token);
    device = await miio.device({ address: host, token: token });
    // console.log("Connected to", device.miioModel);
  } catch (err) {
    console.error(err.stack);
    process.exit(1);
  }
}

async function send(code) {
  await device.call("miIO.ir_play", { freq: 38400, code });
}

function learn() {
  return new Promise(async (resolve, reject) => {
    try {
      const learned = await device.call("miIO.ir_learn", { key: "100" });
      console.log("Learning...", learned);
    } catch (err) {
      // if (err == "Error: Call to device timed out") {
      //   that.platform.log.debug("[ERROR]irLearn - Remote Offline");
      // } else {
      //   that.platform.log.debug("[irLearn][ERROR] Error: " + err);
      // }
      return reject(err);
    }

    let interval = setInterval(async () => {
      try {
        const read = await device.call("miIO.ir_read", { key: "100" });
        console.log("Waiting...", read);

        if (read["code"] !== "") {
          clearInterval(interval);
          interval = undefined;

          // console.log("Learned Code: " + read["code"]);
          console.log("Learn Success!");
          resolve(read["code"]);
        }
      } catch (err) {
        if (err.message === "learn timeout") {
          clearInterval(interval);
          interval = undefined;
          return resolve(null);
        }
        console.error("ERR", err);
      }
    }, 1000);
  });
}
