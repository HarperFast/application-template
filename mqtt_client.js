import * as mqtt from "mqtt";
const client = mqtt.connect("mqtt://localhost:1883/");

const fetch = global.fetch;

let connected = false;
let i = 1;
client.on("connect", () => {
  client.subscribe("dogs/#", {
    qos: 1
  }, (err) => {
    if (!err) {
      setInterval(async () => {
        await fetch('http://localhost:9925/dogs/' + (++i), {method: 'POST', body: JSON.stringify({timestamp: Date.now()}), headers: {'Content-Type': 'application/json'}});
      }, 1000);
    } else {
      console.log(err);
    }
  });
});

client.on("message", function (topic, message) {
  console.log('message', topic, message.toString(), Date.now());
});
