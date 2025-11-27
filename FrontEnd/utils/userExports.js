// src/utils/userExports.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ------------ branding state (editable from your component) ------------ */
let BRAND = {
  companyName: "Hasthi Hotel",
  address: "123 Lake Road, Colombo",
  phone: "+94 77 123 4567",
  email: "info@hasthihotel.example",
  website: "www.hasthihotel.example",
  logoUrl: "/logo.png", // public/logo.png
};
let logoDataURL = null;

/* -------------------- setup / helpers -------------------- */
export async function setBranding(partial = {}) {
  BRAND = { ...BRAND, ...partial };
  // load logo once
  if (!logoDataURL && BRAND.logoUrl) {
    logoDataURL = await loadImageAsDataURL(BRAND.logoUrl).catch(() => null);
  }
}

async function loadImageAsDataURL(url) {
  const res = await fetch(url, { mode: "cors", cache: "force-cache" });
  const blob = await res.blob();
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result);
    r.readAsDataURL(blob);
  });
}

/* -------------------- professional header / footer -------------------- */
function addHeader(doc, { reportTitle, dateStr }) {
  const W = doc.internal.pageSize.getWidth();
  const padX = 40;
  const headerH = 70;

  // light band
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, W, headerH, "F");

  // logo left
  if (logoDataURL) {
    try {
      doc.addImage(logoDataURL, "PNG", padX, 15, 90, 40);
    } catch {}
  }

  // right block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.text(BRAND.companyName, W - padX, 28, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`${reportTitle} (${dateStr})`, W - padX, 44, { align: "right" });

  // gold accent
  doc.setDrawColor(211, 175, 55);
  doc.setLineWidth(1);
  doc.line(padX, headerH, W - padX, headerH);
}

function addFooter(doc, { pageText }) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const padX = 40;
  const footerH = 50;

  // gold line
  doc.setDrawColor(211, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(padX, H - footerH, W - padX, H - footerH);

  // left info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`© ${BRAND.companyName} — Confidential`, padX, H - footerH + 20);
  doc.setTextColor(100);
  doc.text(BRAND.website, padX, H - footerH + 35);

  // right: page text
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(pageText, W - padX, H - footerH + 20, { align: "right" });
}

/* -------------------- public export functions -------------------- */
export function exportUsersCSV(rows, columns) {
  const headers = columns.map((c) => c.header).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = c.map ? c.map(row[c.field]) : row[c.field] ?? "";
        const s = String(raw).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      })
      .join(",")
  );
  const csv = [headers, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportUsersPDF(rows, columns, { title = "Users", orientation = "landscape" } = {}) {
  const doc = new jsPDF({ orientation, unit: "pt", format: "A4" });
  const dateStr = new Date().toLocaleDateString();

  // Header first
  addHeader(doc, { reportTitle: `${title} Report`, dateStr });

  // Build table data
  const head = [columns.map((c) => c.header)];
  const body = rows.map((r) =>
    columns.map((c) => (c.map ? c.map(r[c.field]) : r[c.field] ?? ""))
  );

  // Table (leave room for footer)
  autoTable(doc, {
    head,
    body,
    startY: 90,
    margin: { left: 40, right: 40, bottom: 70 },
    styles: { fontSize: 10, cellPadding: 6, overflow: "linebreak" },
    headStyles: { fillColor: [211, 175, 55] },
  });

  // Footer last (single page target)
  addFooter(doc, { pageText: "Page 1 of 1" });

  doc.save(`${title.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportSingleUserPDF(user, { title = "User Profile" } = {}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
  const dateStr = new Date().toLocaleDateString();

  // Header
  addHeader(doc, { reportTitle: title, dateStr });

  // Details
  const rows = [
    ["Email", user.email],
    ["First Name", user.firstName],
    ["Last Name", user.lastName],
    ["Role", user.role],
    ["Verified", user.isEmailVerified ? "Yes" : "No"],
    ["Disabled", user.isDisabled ? "Yes" : "No"],
    ["Phone", user.phone ?? ""],
  ];

  autoTable(doc, {
    head: [["Field", "Value"]],
    body: rows,
    startY: 100,
    margin: { left: 40, right: 40, bottom: 70 },
    styles: { fontSize: 11, cellPadding: 6 },
    headStyles: { fillColor: [211, 175, 55] },
  });

  // Footer
  addFooter(doc, { pageText: "Page 1 of 1" });

  const safe = (user.email || "profile").replace(/[^a-z0-9]/gi, "_");
  doc.save(`user_${safe}.pdf`);
}
