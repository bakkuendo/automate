import { RedisClient } from "automate";

async function run() {
  const redis = RedisClient.getInstance();
  console.log("instance got");

  await redis.connectConfig({
    port: 6378,
    username: "admin",
    password: "password",
    options: {
      lazyConnect: false,
      maxRetriesPerRequest: 5,
    },
  });
  console.log("connection1 got");

  // await redis.connectURL({
  //   url: "redis://admin:password@localhost:6378",
  //   options: {
  //     lazyConnect: false,
  //     maxRetriesPerRequest: 5,
  //   }
  // });
  // console.log("connection2 got");

  const client = redis.getClient();
  console.log("client got");

  await client.set("hello", "world");
  const value = await client.get("hello");
  console.log("Value:", value);

  await redis.disconnect();
  console.log("disconnect");
}

run()
  .then(() => {
    console.log("ok");
  })
  .catch((e) => {
    console.log(e);
  });
