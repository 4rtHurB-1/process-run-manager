const winston = require("winston");
const TelegramLogger = require("winston-telegram");
const moment = require("moment");

const CONFIGS = {
  token: "1403411176:AAH_eZ_E9DRmsjitnqEVa9haRVv_dWph67Y",
  chat_id: "-1001359009051",
};

const getTelTransportParams = () => {
  return {
    name: "info-channel",
    token: CONFIGS.token,
    chatId: CONFIGS.chat_id,
    level: "info",
    unique: true,
    template: "{message}",
    disableNotification: true,
    formatMessage: (options) => options.message.split(": ")[1],
  };
};

const getWinstonParams = () => {
  return {
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
        (info) =>
          `[${moment(info.timestamp).format("YYYY-MM-DD HH:mm:ss.SSS")}][${
            info.level
          }]${info.message}`
      )
    ),
    defaultMeta: { service: "user-service" },
    exitOnError: false,
  };
};

module.exports = {
  _logger: null,
  _debugLogger: null,

  labels: ["stats", "crawler", "checks", "assigns"],

  _getLogger() {
    return winston.createLogger({
      ...getWinstonParams(),
      level: "info",
      transports: [new winston.transports.Console({ level: "debug" })],
    });
  },

  _getDebugLogger() {
    const logger = winston.createLogger({
      ...getWinstonParams(),
      level: "debug",
      transports: [new winston.transports.Console({ level: "debug" })],
    });

    if (process.env.ENV !== "test") {
      logger.add(
        new TelegramLogger({
          ...getTelTransportParams(),
          level: "debug",
        })
      );

      logger.add(
        new TelegramLogger({
          ...getTelTransportParams(),
          level: "error",
        })
      );
    }

    return logger;
  },

  getLogger(level) {
    if (["error", "debug"].includes(level)) {
      if (!this._debugLogger) {
        this._debugLogger = this._getDebugLogger();
      }

      return this._debugLogger;
    }

    if (!this._logger) {
      this._logger = this._getLogger();
    }

    return this._logger;
  },

  _log(level, message, params) {
    let label, meta;

    if (Array.isArray(params)) {
      if (params.length === 1) {
        if (typeof params[0] === "string" && this.labels.includes(params[0])) {
          label = params[0];
        } else {
          meta = params[0];
        }
      } else if (params.length === 2) {
        label = params[0];
        meta = params[1];
      }
    }

    if (label || this.label) {
      message = `[${label || this.label}]: ${message}`;
    } else {
      message = `: ${message}`;
    }

    this.getLogger(level).log(level, message, {
      metadata: meta,
    });
  },

  setLabel(label) {
    this.label = label;
  },

  info(message, ...params) {
    this._log("info", message, params);
  },

  warning(message, ...params) {
    this._log("warn", message, params);
  },

  error(message, ...params) {
    this._log("error", message, params);
  },

  debug(message, ...params) {
    this._log("debug", message, params);
  },

  debugOrWarn(cond, message, ...params) {
    this._log(cond ? "debug" : "warn", message, params);
  },

  infoOrWarn(cond, message, ...params) {
    this._log(cond ? "info" : "warn", message, params);
  },
};
