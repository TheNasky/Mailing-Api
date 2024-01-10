import express from "express";
import "dotenv/config";

import compression from "compression";
import { connectDb } from "./config/utils/mongoConnect.js";
import { addLogger } from "./config/logger.js"; // Import logger and addLogger
import { logger } from "./config/logger.js";

import mailsRouter from "./routes/Mails/router.js";

connectDb();
const PORT = process.env.PORT || 3000;
const app = express();
app.listen(PORT, () => {
   console.log("listening on port: " + PORT);
});

// Middlewares //
app.use(express.static('public'));
app.use(addLogger);
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests

app.use(compression({})); // Enable response compression

// Routers //

app.use("/api/mails", mailsRouter);

// Error handlers //

//Bad JSON
app.use((err, req, res, next) => {
   if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      res.status(400).json({ error: "Invalid JSON" });
   } else {
      next(err);
   }
});

// Catch all //
app.use((err, req, res, next) => {
   logger.error(`${err.stack}`);
   res.status(500).json({ error: "Internal Server Error (Catch all)" });
});

