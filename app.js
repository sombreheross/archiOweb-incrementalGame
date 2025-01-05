import 'dotenv/config'; // Charge les variables d'environnement depuis .env
import mongoose from 'mongoose';
import express from "express";
import createError from "http-errors";
import logger from "morgan";

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import resourcesRouter from "./routes/resources.js";

// Validate DATABASE_URL
const databaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mongodb')
  ? process.env.DATABASE_URL
  : 'mongodb://127.0.0.1/testDB';

// Connexion à MongoDB
mongoose.connect(databaseUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/resources", resourcesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
