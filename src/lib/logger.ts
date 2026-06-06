export type LogLevel = "info" | "warn" | "error" | "security";

export interface LogEntry {
  level: LogLevel;
  requestId?: string;
  userId?: string;
  route?: string;
  method?: string;
  duration?: number;
  ip?: string;
  message: string;
  error?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  info: 0,
  warn: 1,
  error: 2,
  security: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, context?: Partial<LogEntry>) {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const output = formatLog(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  info(message: string, context?: Partial<LogEntry>) {
    log("info", message, context);
  },

  warn(message: string, context?: Partial<LogEntry>) {
    log("warn", message, context);
  },

  error(message: string, context?: Partial<LogEntry>) {
    log("error", message, context);
  },

  security(message: string, context?: Partial<LogEntry>) {
    log("security", message, context);
  },
};
