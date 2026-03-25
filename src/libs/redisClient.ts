import { Redis as RedisClientType } from "ioredis";
import { RedisConnectConfig } from "../@types/redis";

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

  public connect(url: string): void;

  public connect(config: RedisConnectConfig): void;

  public connect(arg: string | RedisConnectConfig): void {
    throw new Error("Method connect not implemented.");
  }

  public disconnect(): void {
    throw new Error("Method disconnect not implemented.");
  }
}
