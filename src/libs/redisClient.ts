import Redis, { Redis as RedisClientType, RedisOptions } from "ioredis";
import {
  RedisConnectConfig,
  RedisConnectURLConfig,
  RedisURLOptions,
} from "../@types/redis";

export class RedisClient {
  private static instance: RedisClient | null = null;
  private client: RedisClientType | null = null;

  private constructor() {}

  private generateURLOptions(
    opt: RedisURLOptions | undefined,
  ): RedisURLOptions {
    let option: RedisURLOptions = {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    };
    if (!opt || !opt?.maxRetriesPerRequest || !opt?.connectTimeout) {
      option = {
        ...opt,
        maxRetriesPerRequest: opt?.maxRetriesPerRequest
          ? opt?.maxRetriesPerRequest
          : option.maxRetriesPerRequest,
        connectTimeout: opt?.connectTimeout
          ? opt?.connectTimeout
          : option.connectTimeout,
        lazyConnect: option.lazyConnect,
      };
    }
    return option;
  }

  private generateConfigOptions(opt: RedisOptions | undefined): RedisOptions {
    let option: RedisOptions = {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    };
    if (!opt || !opt?.maxRetriesPerRequest || !opt?.connectTimeout) {
      option = {
        ...opt,
        maxRetriesPerRequest: opt?.maxRetriesPerRequest
          ? opt?.maxRetriesPerRequest
          : option.maxRetriesPerRequest,
        connectTimeout: opt?.connectTimeout
          ? opt?.connectTimeout
          : option.connectTimeout,
        lazyConnect: option.lazyConnect,
      };
    }
    return option;
  }

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

  public async connectURL(url: RedisConnectURLConfig): Promise<void>;

  public async connectURL(arg: RedisConnectURLConfig): Promise<void> {
    if (this.client) {
      throw new Error("Already connected to a redis instance.");
    }
    console.log(arg.options);
    arg.options = this.generateURLOptions(arg.options);
    console.log(arg.options);
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
    const client: Redis = new Redis(url, {
      ...arg.options,
    });
    client.on("error", (err) => {
      throw new Error("Redis error: ", err);
    });
    await client.connect();
    this.client = client;
    return;
  }

  public async connectConfig(config: RedisConnectConfig): Promise<void>;

  public async connectConfig(arg: RedisConnectConfig): Promise<void> {
    if (this.client) {
      throw new Error("Already connected to a redis instance.");
    }
    arg.options = this.generateConfigOptions(arg.options);
    if (!arg.username || !arg.port || !arg.password) {
      throw new Error(
        "Connection `username`,`port` or `password` not provided.",
      );
    }
    const client: Redis = new Redis({
      port: arg.port,
      username: arg.username,
      password: arg.password,
      ...arg.options,
    });
    client.on("error", (err) => {
      throw new Error("Redis error: ", err);
    });
    await client.connect();
    this.client = client;
    return;
  }

  public async disconnect(): Promise<void> {
    if (!this.client) return;
    await this.client.quit();
    this.client = null;
    return;
  }
}
