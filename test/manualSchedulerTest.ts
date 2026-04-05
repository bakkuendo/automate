import { RedisClient, Scheduler } from "automate";

// sample version
async function run() {
  const redis = RedisClient.getInstance();
  console.log("instance got");
  await redis.connectURL({
    url: "redis://admin:password@localhost:6378",
    options: {
      lazyConnect: false,
      maxRetriesPerRequest: 5,
    },
  });
  console.log("connection got");
  const client = redis.getClient();
  console.log("client got");
  const scheduler = new Scheduler();
  await scheduler
    .sampleRun(client)
    .then(() => {})
    .catch((e) => {
      console.log("Scheduler Run Error: ", e.message);
    });
}

run()
  .then(() => {
    console.log("ok");
  })
  .catch((e) => {
    console.log(e);
  });
