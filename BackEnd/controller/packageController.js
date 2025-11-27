import PackageDetails from "../models/Package.js";

export const createPackageDetails = async (req, res) => {
  try {
    const doc = await PackageDetails.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listPackageDetails = async (req, res) => {
  try {
    const { roomId, active, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (roomId) filter.roomId = roomId;
    if (active !== undefined) filter.isActive = active === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      PackageDetails.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      PackageDetails.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getPackageDetails = async (req, res) => {
  try {
    const doc = await PackageDetails.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updatePackageDetails = async (req, res) => {
  try {
    const doc = await PackageDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deletePackageDetails = async (req, res) => {
  try {
    const doc = await PackageDetails.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
