import { env } from "@/lib/env";
import type { Logger } from "pino";

type LogMethod = (...args: unknown[]) => void;

interface ClientLogger {
  info: LogMethod;
  error: LogMethod;
  warn: LogMethod;
  debug: LogMethod;
  trace: LogMethod;
  fatal: LogMethod;
}

const createLogger = (): Logger | ClientLogger => {
  if (typeof window !== "undefined") {
    const noop: LogMethod = () => {};
    return {
      info: noop,
      error: noop,
      warn: noop,
      debug: noop,
      trace: noop,
      fatal: noop,
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pino = require("pino");

    const config = {
      level: env.isProduction ? "info" : "debug",
      ...(!env.isProduction && {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:standard",
          },
        },
      }),
    };

    return pino(config);
  } catch (error) {
    console.error("Failed to initialize Pino logger:", error);
    return {
      info: console.info.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      debug: console.debug.bind(console),
      trace: console.trace.bind(console),
      fatal: console.error.bind(console),
    };
  }
};

export default createLogger();
