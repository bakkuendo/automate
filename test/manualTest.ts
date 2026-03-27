import { RedisClient } from "automate";

async function run() {
  const redis = RedisClient.getInstance();

  await redis.connect({
    port: 6378,
    username: "default",
    password: "yourpassword",
  });

  const client = redis.getClient();

  await client.set("hello", "world");

  const value = await client.get("hello");

  console.log("Value:", value);

  await redis.disconnect();
}

run();
