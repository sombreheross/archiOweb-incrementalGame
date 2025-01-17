import User from "./models/User.js";
import supertest from "supertest";
import app from "./app.js";

export const cleanUpDatabase = async function() {
  await Promise.all([
    User.deleteMany()
  ]);
};

