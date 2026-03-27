import { RedisOptions } from "ioredis";

export type RedisURLOptions = Omit<
  RedisOptions,
  "host" | "port" | "username" | "password"
>;

export type RedisConnectURLConfig = {
  url: string;
  options?: redisURLOptions;
};

export type RedisConnectConfig = {
  port: number;
  username: string;
  password: string;
  options?: RedisOptions;
};
