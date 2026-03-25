import { RedisOptions } from "ioredis";

type redisURLOptions = Omit<
  RedisOptions,
  "host" | "port" | "username" | "password"
>;

export type RedisConnectURLConfig = {
  type: "RedisConnectURLConfig";
  url: string;
  options?: redisURLOptions;
};

export type RedisConnectConfig = {
  type: "RedisConnectConfig";
  port: number;
  username: string;
  password: string;
  options?: RedisOptions;
};
