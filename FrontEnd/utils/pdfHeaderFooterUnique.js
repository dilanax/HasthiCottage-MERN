// src/utils/pdfHeaderFooterUnique.js
// Utilities for per-page unique headers/footers in jsPDF + jspdf-autotable

/** Load an image URL (e.g. /logo.png) as a dataURL for jsPDF */
export async function loadImageAsDataURL(url) {
  try {
    const res = await fetch(url, { mode: "cors", cache: "force-cache" });
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Draw a single page header/footer.
 * Pass in whatever text you want *for this specific page*.
 */
export function drawHeaderFooterUnique(doc, {
  logoDataURL = null,
  headerLeftTitle = "",
  headerLeftSubtitle = "",
  headerRightTitle = "",
  headerRightSubtitle = "",
  footerLeftTop = "",
  footerLeftBottom = "",
  footerRight = "",
  bandColor = [248, 248, 248],
}) {
  const size = doc.internal.pageSize;
  const W = size.getWidth();
  const H = size.getHeight();
  const padX = 40;
  const headerH = 70;
  const footerH = 40;

  // Header band
  doc.setFillColor(...bandColor);
  doc.rect(0, 0, W, headerH, "F");

  // Logo (optional)
  const logoW = 120, logoH = 36, logoX = padX, logoY = 18;
  if (logoDataURL) {
    try { doc.addImage(logoDataURL, "PNG", logoX, logoY, logoW, logoH); } catch {}
  }

  // Header left (title/subtitle)
  const textLeftX = padX + (logoDataURL ? logoW + 14 : 0);
  doc.setFontSize(16); doc.setTextColor(10);
  if (headerLeftTitle) doc.text(headerLeftTitle, textLeftX, 28);
  doc.setFontSize(10); doc.setTextColor(90);
  if (headerLeftSubtitle) doc.text(headerLeftSubtitle, textLeftX, 45);

  // Header right (title/subtitle)
  const rightX = W - padX;
  doc.setFontSize(12); doc.setTextColor(10);
  if (headerRightTitle) doc.text(headerRightTitle, rightX, 22, { align: "right" });
  doc.setFontSize(10); doc.setTextColor(90);
  if (headerRightSubtitle) doc.text(headerRightSubtitle, rightX, 38, { align: "right" });

  // Footer line
  doc.setDrawColor(220); doc.line(padX, H - footerH, W - padX, H - footerH);

  // Footer left
  doc.setFontSize(9); doc.setTextColor(120);
  if (footerLeftTop) doc.text(footerLeftTop, padX, H - footerH + 14);
  if (footerLeftBottom) doc.text(footerLeftBottom, padX, H - footerH + 28);

  // Footer right
  if (footerRight) doc.text(footerRight, W - padX, H - footerH + 22, { align: "right" });
}

/** Standard margins that leave room for header & footer */
export function pdfMargins() {
  return { top: 80, bottom: 60, left: 40, right: 40 };
}
