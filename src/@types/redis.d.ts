import { RedisOptions } from "ioredis";

export type RedisConnectConfig = {
  port: number;
  username: string;
  password: string;
  options?: RedisOptions;
};
