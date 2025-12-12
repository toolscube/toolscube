import { pino, type Logger } from "pino";
import { env } from "./env";

const logger: Logger = pino({
  ...(env.isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  }),
  level: process.env.PINO_LOG_LEVEL || "info",
});

export default logger;
