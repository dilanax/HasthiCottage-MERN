import mongoose from "mongoose";
import Counter from "../models/Counter.js";

async function initCounter() {
  await mongoose.connect(process.env.MONGO_URL);
  await Counter.create({ id: "reservationNumber", seq: 1000 }); // Start from 1000
  console.log("Counter initialized");
  await mongoose.connection.close();
}

initCounter().catch(console.error);