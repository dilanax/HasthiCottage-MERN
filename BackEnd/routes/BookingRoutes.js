import express from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import Booking from "../models/BookingModel.js";

const router = express.Router();

// ---------- Helpers (no 'toDate' anywhere) ----------
const parseDateSafe = (val, fallback) => {
  const d = val ? new Date(val) : null;
  return isNaN(d?.getTime?.()) ? fallback : d;
};
const COLOMBO_TZ = "Asia/Colombo";

// __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CREATE
router.post("/", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIST
// GET /api/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD&page=1&limit=50&search=term
router.get("/", async (req, res) => {
  try {
    const { from, to, page = 1, limit = 50, search = "" } = req.query;

    const startDate = parseDateSafe(from, new Date("2000-01-01"));
    const endDate   = parseDateSafe(to,   new Date("2100-01-01"));

    const matchStage = { createdAt: { $gte: startDate, $lte: endDate } };

    const pipeline = [
      { $match: matchStage },

      // With packageId as ObjectId, use localField/foreignField
      {
        $lookup: {
          from: "packages",
          localField: "packageId",
          foreignField: "_id",
          as: "package"
        }
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },

      ...(search
        ? [{
            $match: {
              $or: [
                { name:   { $regex: search, $options: "i" } },
                { email:  { $regex: search, $options: "i" } },
                { phone:  { $regex: search, $options: "i" } },
                { "package.destination":  { $regex: search, $options: "i" } },
                { "package.description":  { $regex: search, $options: "i" } }
              ]
            }
          }]
        : []),

      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1, createdAt: 1, name: 1, phone: 1, email: 1,
          visitors: 1, price: 1, packageId: 1,
          package: { destination: 1, type: 1, price: 1, description: 1 }
        }
      },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    ];

    const [rows, totalArr] = await Promise.all([
      Booking.aggregate(pipeline),
      Booking.aggregate([{ $match: matchStage }, { $count: "total" }])
    ]);

    res.json({
      rows,
      total: totalArr[0]?.total || 0,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ANALYTICS (Mongo-friendly without $dateTrunc)
router.get("/analytics", async (req, res) => {
  try {
    const { period = "monthly", from, to } = req.query;

    const startDate = parseDateSafe(from, new Date("2000-01-01"));
    const endDate   = parseDateSafe(to,   new Date("2100-01-01"));

    const matchStage = { createdAt: { $gte: startDate, $lte: endDate } };

    let groupStage;
    let sortStage;
    let projectStage;

    if (period === "weekly") {
      // Group by ISO week
      groupStage = {
        _id: { y: { $isoWeekYear: "$createdAt" }, w: { $isoWeek: "$createdAt" } },
        totalSales: { $sum: "$price" },
        totalVisitors: { $sum: "$visitors" },
        count: { $sum: 1 }
      };
      sortStage = { "_id.y": 1, "_id.w": 1 };
      projectStage = {
        periodStart: {
          $dateFromParts: { isoWeekYear: "$_id.y", isoWeek: "$_id.w", isoDayOfWeek: 1, timezone: COLOMBO_TZ }
        },
        totalSales: 1, totalVisitors: 1, count: 1, _id: 0
      };
    } else {
      // monthly
      groupStage = {
        _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
        totalSales: { $sum: "$price" },
        totalVisitors: { $sum: "$visitors" },
        count: { $sum: 1 }
      };
      sortStage = { "_id.y": 1, "_id.m": 1 };
      projectStage = {
        periodStart: {
          $dateFromParts: { year: "$_id.y", month: "$_id.m", day: 1, timezone: COLOMBO_TZ }
        },
        totalSales: 1, totalVisitors: 1, count: 1, _id: 0
      };
    }

    const data = await Booking.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: sortStage },
      { $project: projectStage }
    ]);

    res.json({ period, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REPORT
router.get("/report", async (req, res) => {
  try {
    const { period = "monthly", from, to } = req.query;
    const startDate = parseDateSafe(from, new Date("2000-01-01"));
    const endDate   = parseDateSafe(to,   new Date("2100-01-01"));

    const rows = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $lookup: {
          from: "packages",
          localField: "packageId",
          foreignField: "_id",
          as: "package"
        }
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 0,
          createdAt: 1, name: 1, phone: 1, email: 1,
          visitors: "$package.visitors", price: "$package.price",
          packageDestination: "$package.destination",
          packageType: "$package.type"
        }
      }
    ]);

    // ensure /reports dir
    const reportsDir = path.join(__dirname, "..", "reports");
    await fse.ensureDir(reportsDir);

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `bookings-${period}-${stamp}.pdf`;
    const filePath = path.join(reportsDir, filename);

    // build PDF
    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(18).text("Safari Bookings Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).text(
      `Period: ${period.toUpperCase()} | From: ${startDate.toISOString().slice(0, 10)} | To: ${endDate.toISOString().slice(0, 10)}`,
      { align: "center" }
    );
    doc.moveDown(0.5);

    const summary = rows.reduce(
      (acc, r) => {
        acc.totalSales += Number(r.price || 0);
        acc.totalVisitors += Number(r.visitors || 0);
        acc.count += 1;
        return acc;
      },
      { totalSales: 0, totalVisitors: 0, count: 0 }
    );

    doc.roundedRect(40, doc.y, 515, 60, 6).stroke();
    const sy = doc.y + 8;
    doc.fontSize(12);
    doc.text(`Total Bookings: ${summary.count}`, 50, sy);
    doc.text(`Total Visitors: ${summary.totalVisitors}`, 240, sy);
    doc.text(`Total Sales: Rs. ${summary.totalSales.toLocaleString()}`, 430, sy);
    doc.moveDown(4);

// Table header
const headerY = doc.y + 10;

// NEW column widths (sum = 515)
const cols = [
  { key: "createdAt",           label: "Date",        width: 58 },
  { key: "name",                label: "Name",        width: 88 },
  { key: "email",               label: "Email",       width: 100 },
  { key: "phone",               label: "Phone",       width: 68 },
  { key: "packageDestination",  label: "Destination", width: 85 },
  { key: "packageType",         label: "Type",        width: 46 },
  { key: "visitors",            label: "Vis",         width: 30 },
  { key: "price",               label: "Rs.",         width: 40 }
];

const leftX = 20;        // start at the left margin
const rightX = 700;      // page right edge
const rowHeight = 16;
const headerLineGap = 14;
const maxY = 780;

// small helpers
const fmt = (v) => (v == null ? "" : String(v));
const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);
const fmtRs = (n) => Number(n || 0).toLocaleString();

function drawHeader(y) {
  let x = leftX;
  doc.fontSize(10).font("Helvetica-Bold");
  cols.forEach((c) => {
    doc.text(c.label, x, y, { width: c.width });
    x += c.width;
  });
  doc.moveTo(leftX, y + headerLineGap).lineTo(rightX, y + headerLineGap).stroke();
  doc.font("Helvetica");
  return y + headerLineGap + 6; // next row y
}

function drawRow(r, y) {
  let x = leftX;
  const cells = [
    fmtDate(r.createdAt),
    fmt(r.name),
    fmt(r.email),
    fmt(r.phone),
    fmt(r.packageDestination),
    fmt(r.packageType),
    fmt(r.visitors),
    fmtRs(r.price)
  ];
  cells.forEach((val, i) => {
    doc.text(val, x, y, { width: cols[i].width });
    x += cols[i].width;
  });
  return y + rowHeight;
}

// draw header
let y = drawHeader(headerY);

// rows with page break + header repeat
for (const r of rows) {
  if (y > maxY) {
    doc.addPage();
    y = drawHeader(60);
  }
  y = drawRow(r, y);
}

    doc.end();

    writeStream.on("finish", () => {
      const publicUrl = `${req.protocol}://${req.get("host")}/reports/${filename}`;
      res.json({ message: "Report generated", url: publicUrl, path: `/reports/${filename}` });
    });
    writeStream.on("error", () => res.status(500).json({ error: "Failed to write PDF" }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
