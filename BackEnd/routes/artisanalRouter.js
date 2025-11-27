import express from "express";
import {
  createArtisanal,
  getArtisanalById,
  getAllArtisanal,
  updateArtisanal,
  deleteArtisanal,
  listPublicArtisanal,
} from "../controller/artisanalController.js";

const artisanalRouter = express.Router();

// CRUD
artisanalRouter.post("/create", createArtisanal);
artisanalRouter.get("/all", getAllArtisanal);
artisanalRouter.get("/get/:artisanalId", getArtisanalById);
artisanalRouter.put("/update/:artisanalId", updateArtisanal);
artisanalRouter.delete("/delete/:artisanalId", deleteArtisanal);

// Public-light list
artisanalRouter.get("/items", listPublicArtisanal);

export default artisanalRouter;
