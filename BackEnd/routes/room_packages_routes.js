import express from "express";
import { validate } from "../middleware/validate.js";
import {
  createPackageDetails,
  listPackageDetails,
  getPackageDetails,
  updatePackageDetails,
  deletePackageDetails,
} from "../controller/packageController.js";
import {
  createPackageDetailsSchema,
  updatePackageDetailsSchema,
} from "../validators/packageDetails.schema.js";
import PackageDetails from "../models/Package.js";
// If you have a Room model with codes/ids, you can use it instead:
// import Room from "../models/Room.js";

const roomPkg = express.Router();

/** ---- LIST ---- */
// existing
roomPkg.get("/", listPackageDetails);
// new path so FE `/packages` works
roomPkg.get("/packages", listPackageDetails);

// filter by room (re-uses list)
roomPkg.get("/room/:roomId", (req, res, next) => {
  req.query.roomId = req.params.roomId;
  return listPackageDetails(req, res, next);
});

/** ---- READ ONE ---- */
// existing
roomPkg.get("/:id", getPackageDetails);
// new
roomPkg.get("/packages/:id", getPackageDetails);

/** ---- CREATE ---- */
// existing
roomPkg.post("/", validate(createPackageDetailsSchema), createPackageDetails);
// new
roomPkg.post("/packages", validate(createPackageDetailsSchema), createPackageDetails);

/** ---- UPDATE ---- */
// existing
roomPkg.put("/:id", validate(updatePackageDetailsSchema), updatePackageDetails);
// new
roomPkg.put("/packages/:id", validate(updatePackageDetailsSchema), updatePackageDetails);

/** ---- DELETE ---- */
// existing
roomPkg.delete("/:id", deletePackageDetails);
// new
roomPkg.delete("/packages/:id", deletePackageDetails);

/** ---- ROOM IDS for dropdown ----
 * Returns distinct string room IDs present in packages.
 * If you prefer Room collection, switch to Room.distinct('_id') or 'code'.
 */
roomPkg.get("/room-packages/ids", async (_req, res) => {
  try {
    const ids = await PackageDetails.distinct("roomId");
    res.json({ success: true, data: ids.filter(Boolean).sort() });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default roomPkg;

// app.js / index.js
// app.use('/api/room_package', roomPkg);
