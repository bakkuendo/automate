import Redis from "ioredis";

// sample version
export class Scheduler {
  private redisClient: Redis | null = null;
  private isRunning: boolean = false;

  constructor() {}

  public async sampleRun(redisClient: Redis): Promise<void> {
    if (this.isRunning) {
      throw new Error("Scheduler is already running.");
    }
    if (!redisClient) {
      throw new Error("Redis client is required to run the scheduler.");
    }
    this.redisClient = redisClient;

    try {
      const pong = await this.redisClient.ping();
      if (pong !== "PONG") {
        throw new Error("Redis connection not healthy.");
      }
      this.isRunning = true;
      console.log("Scheduler started!!");
      await this.startPolling();
    } catch (error) {
      this.isRunning = false;
      console.log("Scheduler failed to start", error);
      throw error;
    }
  }

  private async startPolling(): Promise<void> {
    if (!this.redisClient) {
      return;
    }
    console.log("Polling started");

    setInterval(async () => {
      try {
        const time = new Date().toISOString();
        await this.redisClient?.set("scheduler:lastRun", time);
        console.log(`Scheduler tick at ${time}`);
      } catch (error) {
        console.error("Error during scheduler tick", error);
      }
    }, 5000);
  }
}
