import { env } from "@/lib/env";
import pino from "pino";

const logger = pino({
  level: env.isProduction ? "info" : "debug",
});

export default logger;
