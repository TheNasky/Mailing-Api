import { format, createLogger, transports, addColors } from "winston";
const { combine, printf } = format;
import ip from "ip";
import dotenv from "dotenv";
dotenv.config();
export let logger;

const myCustomLevels = {
   levels: {
      debug: 5,
      http: 4,
      info: 3,
      warn: 2,
      error: 1,
      fatal: 0,
   },
   colors: {
      debug: "green",
      http: "bold blue",
      info: "gray",
      warn: "yellow",
      error: "red",
      fatal: "redBG grey",
   },
};

/* // Time Only //

const myFormat = printf(({ level, message }) => {
   return `[${new Date().toLocaleTimeString()}] [${level}]: ${message}`;
});

const myFormatFile = printf(({ level, message }) => {
   return `[${new Date().toLocaleTimeString()}] [${level.toLocaleUpperCase()}]: ${message}`;
});
*/

// Date and Time //

const myFormat = printf(({ level, message }) => {
   const now = new Date();
   const options = {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
   };
   const formattedDate = now.toLocaleString("en-GB", options);
   return `[${formattedDate}] [${level}]: ${message}`;
});

const myFormatFile = printf(({ level, message }) => {
   const now = new Date();
   const options = {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
   };
   const formattedDate = now.toLocaleString("en-GB", options);
   return `[${formattedDate}] [${level.toLocaleUpperCase()}]: ${message}`;
});

addColors(myCustomLevels.colors);

switch (process.env.ENVIRONMENT) {
   case "DEVELOPMENT":
      logger = createLogger({
         levels: myCustomLevels.levels,
         transports: [
            new transports.Console({
               level: "debug",
               format: combine(format.colorize({ all: true }), myFormat),
            }),
            new transports.File({
               filename: "./dev.errors.logs",
               level: "error",
               format: myFormatFile,
               maxsize: 5242880, // 5MB
               maxFiles: 5,
            }),
         ],
      });
      break;
   case "PRODUCTION":
      logger = createLogger({
         levels: myCustomLevels.levels, // Niveles personalizados
         transports: [
            new transports.Console({
               level: "info",
               format: combine(format.colorize({ all: true }), myFormat),
            }),

            new transports.File({
               filename: "./errors.logs",
               level: "error",
               format: myFormatFile,
               maxsize: 5242880, // 5MB
               maxFiles: 5,
            }),
         ],
      });
      break;
   default:
      break;
}

export const addLogger = (req, res, next) => {
   req.logger = logger;
   const ipClient = ip.address();
   const start = Date.now(); // Record the start time

   res.on("finish", () => {
      const end = Date.now(); // Record the end time
      const duration = end - start; // Calculate the duration
      req.logger.http(
         `${req.method} Method hit on ${req.originalUrl} from [${ipClient}] - ${duration}ms`,
      );
   });

   next();
};
