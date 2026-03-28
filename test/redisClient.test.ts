import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RedisClient } from "automate";

const CONFIG = {
  port: 6378,
  username: "admin",
  password: "password",
};

const WRONG_CONFIG = {
  port: 6378,
  username: "admin",
  password: "wrong",
};

const URL_CONFIG = {
  url: "redis://admin:password@127.0.0.1:6378",
  options: {
    lazyConnect: false,
    maxRetriesPerRequest: 5,
  },
};

describe("RedisClient (connectConfig)", () => {
  let redis: RedisClient;

  beforeEach(async () => {
    redis = RedisClient.getInstance();
    try {
      await redis.disconnect();
    } catch {}
  });

  afterEach(async () => {
    try {
      await redis.disconnect();
    } catch {}
  });

  it("should connect successfully", async () => {
    await redis.connectConfig(CONFIG);
    expect(redis.getClient()).toBeDefined();
  });

  it("should not allow double connection", async () => {
    await redis.connectConfig(CONFIG);
    await expect(redis.connectConfig(CONFIG)).rejects.toThrow(
      "Already connected",
    );
  });

  it("should set and get value", async () => {
    await redis.connectConfig(CONFIG);
    const client = redis.getClient();

    await client.set("config-key", "value");
    const value = await client.get("config-key");

    expect(value).toBe("value");
  });

  it("should delete key", async () => {
    await redis.connectConfig(CONFIG);
    const client = redis.getClient();

    await client.set("del-key", "value");
    await client.del("del-key");

    const value = await client.get("del-key");
    expect(value).toBeNull();
  });

  it("should throw if not connected", () => {
    expect(() => redis.getClient()).toThrow("Redis not connected");
  });

  it("should disconnect properly", async () => {
    await redis.connectConfig(CONFIG);
    await redis.disconnect();

    expect(() => redis.getClient()).toThrow();
  });

  it("should reconnect after disconnect", async () => {
    await redis.connectConfig(CONFIG);
    await redis.disconnect();

    await redis.connectConfig(CONFIG);
    expect(redis.getClient()).toBeDefined();
  });

  it("should fail with wrong credentials", async () => {
    await expect(redis.connectConfig(WRONG_CONFIG)).rejects.toThrow();
  });

  it("should perform multiple operations correctly", async () => {
    await redis.connectConfig(CONFIG);
    const client = redis.getClient();

    await client.set("multi-1", "A");
    await client.set("multi-2", "B");

    const v1 = await client.get("multi-1");
    const v2 = await client.get("multi-2");

    expect(v1).toBe("A");
    expect(v2).toBe("B");
  });
});

describe("RedisClient (connectURL)", () => {
  let redis: RedisClient;

  beforeEach(async () => {
    redis = RedisClient.getInstance();
    try {
      await redis.disconnect();
    } catch {}
  });

  afterEach(async () => {
    try {
      await redis.disconnect();
    } catch {}
  });

  it("should connect successfully via URL", async () => {
    await redis.connectURL(URL_CONFIG);
    expect(redis.getClient()).toBeDefined();
  });

  it("should not allow double connection", async () => {
    await redis.connectURL(URL_CONFIG);
    await expect(redis.connectURL(URL_CONFIG)).rejects.toThrow(
      "Already connected",
    );
  });

  it("should set and get value via URL", async () => {
    await redis.connectURL(URL_CONFIG);
    const client = redis.getClient();

    await client.set("url-key", "value");
    const value = await client.get("url-key");

    expect(value).toBe("value");
  });

  it("should delete key via URL", async () => {
    await redis.connectURL(URL_CONFIG);
    const client = redis.getClient();

    await client.set("url-del", "value");
    await client.del("url-del");

    const value = await client.get("url-del");
    expect(value).toBeNull();
  });

  it("should throw if not connected", () => {
    expect(() => redis.getClient()).toThrow("Redis not connected");
  });

  it("should disconnect properly", async () => {
    await redis.connectURL(URL_CONFIG);
    await redis.disconnect();

    expect(() => redis.getClient()).toThrow();
  });

  it("should reconnect after disconnect", async () => {
    await redis.connectURL(URL_CONFIG);
    await redis.disconnect();

    await redis.connectURL(URL_CONFIG);
    expect(redis.getClient()).toBeDefined();
  });

  it("should fail with wrong credentials", async () => {
    await expect(
      redis.connectURL({
        url: "redis://admin:wrong@127.0.0.1:6378",
      }),
    ).rejects.toThrow();
  });

  it("should fail with invalid URL", async () => {
    await expect(redis.connectURL({ url: "http://invalid" })).rejects.toThrow(
      "Invalid Redis URL",
    );
  });

  it("should perform multiple operations via URL", async () => {
    await redis.connectURL(URL_CONFIG);
    const client = redis.getClient();

    await client.set("u1", "X");
    await client.set("u2", "Y");

    const v1 = await client.get("u1");
    const v2 = await client.get("u2");

    expect(v1).toBe("X");
    expect(v2).toBe("Y");
  });
});
