import Order from "../models/OrderModel.js";
import MenuItem from "../models/MenuItemModel.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Create (admin/reception can enter orders; optional for analysis but useful)
export const createOrder = async (req, res) => {
  try {
    const { customer, items, type } = req.body;
    if (!customer?.fullName || !customer?.address || !customer?.phone) {
      return res.status(400).json({ message: "Customer details are required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    const hydrated = [];
    for (const it of items) {
      const doc = await MenuItem.findById(it.menuItem);
      if (!doc) return res.status(400).json({ message: "Menu item not found: " + it.menuItem });
      const qty = Number(it.qty || 1);
      hydrated.push({
        menuItem: doc._id, name: doc.name, category: doc.category,
        price: doc.price, qty, spicyLevel: doc.spicyLevel ?? 0, tags: doc.tags || []
      });
    }
    const total = hydrated.reduce((s, x) => s + x.price * x.qty, 0);

    const order = await Order.create({ customer, items: hydrated, type: type || "TAKEAWAY", total, paid: false });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List (filters for analysis)
export const listOrders = async (req, res) => {
  try {
    const { status, type, q, dateFrom, dateTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (q) {
      filter.$or = [
        { "customer.fullName": { $regex: q, $options: "i" } },
        { "customer.phone": { $regex: q, $options: "i" } },
        { "customer.address": { $regex: q, $options: "i" } },
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo); end.setHours(23,59,59,999);
        filter.createdAt.$lte = end;
      }
    }
    const data = await Order.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrder = async (req, res) => {
  try { const o = await Order.findById(req.params.id); if (!o) return res.status(404).json({ message: "Order not found" }); res.json(o); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateOrder = async (req, res) => {
  try {
    const { status, paid } = req.body;
    const payload = {};
    if (status) payload.status = status;
    if (paid !== undefined) payload.paid = paid;
    const updated = await Order.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const removeOrder = async (req, res) => {
  try { await Order.findByIdAndDelete(req.params.id); res.json({ message: "Order deleted" }); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

// PDF export for analysis
export const exportOrdersPdf = async (req, res) => {
  try {
    const { dateFrom, dateTo, status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) { const end = new Date(dateTo); end.setHours(23,59,59,999); filter.createdAt.$lte = end; }
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const reportsDir = path.join(__dirname, "..", "reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const file = path.join(reportsDir, `orders-${ts}.pdf`);
    const doc = new PDFDocument({ margin: 32, size: "A4" });
    const stream = fs.createWriteStream(file);
    doc.pipe(stream);

    doc.fontSize(18).text("Orders Report", { align: "center" });
    doc.moveDown(0.5).fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
    if (dateFrom || dateTo || status || type) {
      doc.moveDown(0.3).text(`Filters: from=${dateFrom || "-"} to=${dateTo || "-"} status=${status || "-"} type=${type || "-"}`, { align: "center" });
    }
    doc.moveDown();

    let grand = 0;
    orders.forEach(o => {
      doc.moveDown(0.4);
      doc.fontSize(12).text(`#${o._id}`, { continued: true }).text(`  |  ${o.status}`, { align: "right" });
      doc.fontSize(10).text(`${o.createdAt.toLocaleString()}  |  ${o.type}`);
      doc.text(`Customer: ${o.customer.fullName} | ${o.customer.phone}`);
      doc.text(`Address: ${o.customer.address}`);
      if (o.customer.note) doc.text(`Note: ${o.customer.note}`);
      doc.moveDown(0.2).text('Items:');
      o.items.forEach(it => doc.text(`  • ${it.name} x${it.qty} @ ${it.price.toFixed(2)} = ${(it.qty*it.price).toFixed(2)}`));
      doc.text(`Total: ${o.total.toFixed(2)} | Paid: ${o.paid ? "Yes" : "No"}`);
      doc.moveDown(0.2).moveTo(32, doc.y).lineTo(560, doc.y).strokeColor("#ddd").stroke();
      grand += o.total; if (doc.y > 740) doc.addPage();
    });

    doc.moveDown(1).fontSize(12).text(`Grand Total: ${grand.toFixed(2)}`, { align: "right" });
    doc.end();

    stream.on("finish", () => res.json({ file: `reports/${path.basename(file)}` }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
