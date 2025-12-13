const isServer = typeof window === "undefined";
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

interface EnvOptions {
  defaultValue?: string;
  required?: boolean;
  serverOnly?: boolean;
}

interface NumericEnvOptions {
  defaultValue: number;
  serverOnly?: boolean;
}

function getEnvVar(key: string, options: EnvOptions = {}): string {
  const { defaultValue = "", required = false, serverOnly = false } = options;

  if (serverOnly && !isServer) {
    return "";
  }

  const value = process.env[key];

  if (value !== undefined && value !== "") {
    return value;
  }

  if (defaultValue) {
    return defaultValue;
  }

  if (
    required &&
    !isBuildTime &&
    (isServer || key.startsWith("NEXT_PUBLIC_"))
  ) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return "";
}

function getEnvNumber(
  key: string,
  options: NumericEnvOptions = { defaultValue: 0 }
): number {
  const { defaultValue, serverOnly = false } = options;

  if (serverOnly && !isServer) {
    return defaultValue;
  }

  const value = process.env[key];
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    if (isServer) {
      console.warn(`Invalid number for ${key}, using default: ${defaultValue}`);
    }
    return defaultValue;
  }

  return parsed;
}

export const env = {
  app: {
    url: getEnvVar("NEXT_PUBLIC_APP_URL", {
      defaultValue: "http://localhost:3000",
    }),
    siteUrl: getEnvVar("NEXT_PUBLIC_SITE_URL", {
      defaultValue: "https://toolscube.app",
    }),
  },

  db: {
    get url() {
      return getEnvVar("DATABASE_URL", { required: true, serverOnly: true });
    },
  },

  email: {
    get host() {
      return getEnvVar("EMAIL_SERVER_HOST", {
        required: false,
        serverOnly: true,
      });
    },
    get port() {
      return getEnvNumber("EMAIL_SERVER_PORT", {
        defaultValue: 587,
        serverOnly: true,
      });
    },
    get user() {
      return getEnvVar("EMAIL_SERVER_USER", {
        required: false,
        serverOnly: true,
      });
    },
    get password() {
      return getEnvVar("EMAIL_SERVER_PASSWORD", {
        required: false,
        serverOnly: true,
      });
    },
    get from() {
      return getEnvVar("EMAIL_FROM", {
        defaultValue: "noreply@toolscube.app",
        serverOnly: true,
      });
    },
  },

  auth: {
    get secret() {
      return getEnvVar("BETTER_AUTH_SECRET", {
        required: true,
        serverOnly: true,
      });
    },
    get url() {
      return getEnvVar("BETTER_AUTH_URL", {
        defaultValue: "http://localhost:3000",
        serverOnly: true,
      });
    },
    google: {
      get clientId() {
        return getEnvVar("GOOGLE_CLIENT_ID", {
          required: false,
          serverOnly: true,
        });
      },
      get clientSecret() {
        return getEnvVar("GOOGLE_CLIENT_SECRET", {
          required: false,
          serverOnly: true,
        });
      },
    },
  },

  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;

export type Env = typeof env;
