import Redis, { Redis as RedisClientType } from "ioredis";
import { RedisConnectConfig, RedisConnectURLConfig } from "../@types/redis";

export class RedisClient {
  private static instance: RedisClient | null = null;
  private client: RedisClientType | null = null;

  private constructor() {}

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public getClient(): RedisClientType {
    if (!this.client) {
      throw new Error("Redis not connected. Call connect() first.");
    }
    return this.client;
  }

  public async connect(url: RedisConnectURLConfig): Promise<void>;

  public async connect(config: RedisConnectConfig): Promise<void>;

  public async connect(
    arg: RedisConnectURLConfig | RedisConnectConfig,
  ): Promise<void> {
    if (this.client) {
      throw new Error("Already connected to a redis instance.");
      return;
    }
    if (
      !arg.options ||
      !arg.options?.maxRetriesPerRequest ||
      !arg.options?.connectTimeout ||
      !arg.options?.lazyConnect
    ) {
      arg.options = {
        maxRetriesPerRequest: arg.options?.maxRetriesPerRequest
          ? arg.options?.maxRetriesPerRequest
          : 3,
        connectTimeout: arg.options?.connectTimeout
          ? arg.options?.connectTimeout
          : 5000,
        lazyConnect: arg.options?.lazyConnect ? arg.options?.lazyConnect : true,
        ...arg.options,
      };
    }
    if (arg.type === "RedisConnectURLConfig") {
      let url: string;
      if (
        arg.url.split(":")[0] === "redis" ||
        arg.url.split(":")[0] === "rediss"
      ) {
        url = arg.url;
      } else {
        throw new Error(
          `Invalid Redis URL: "${arg}". Expected format: redis://user:password@host:port`,
        );
      }
      new Promise((resolve, reject) => {
        const client: Redis = new Redis(url, {
          ...arg.options,
        });
        client.on("error", (err) => {
          throw new Error("Redis error: ", err);
        });
        client
          .connect()
          .then(() => {
            this.client = client;
            resolve(this.client);
          })
          .catch((err) => {
            reject(new Error(`Failed to connect to Redis: ${err.message}`));
          });
      });
      return;
    }
    if (!arg.username || !arg.port || !arg.password) {
      throw new Error(
        "Connection `username`,`port` or `password` not provided.",
      );
    }
    new Promise((resolve, reject) => {
      const client: Redis = new Redis({
        port: arg.port,
        username: arg.username,
        password: arg.password,
        ...arg.options,
      });
      client.on("error", (err) => {
        throw new Error("Redis error: ", err);
      });
      client
        .connect()
        .then(() => {
          this.client = client;
          resolve(this.client);
        })
        .catch((err) => {
          reject(new Error(`Failed to connect to Redis: ${err.message}`));
        });
    });
    return;
  }

  public async disconnect(): Promise<void> {
    if (!this.client) return;
    await this.client.quit();
    this.client = null;
    return;
  }
}
