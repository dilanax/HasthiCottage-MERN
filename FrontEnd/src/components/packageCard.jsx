import React from "react";
import { convertAndFormatLKRToUSD } from "../utils/currencyUtils.js";

function currency(n) {
  if (n === undefined || n === null) return "-";
  return convertAndFormatLKRToUSD(n);
}

export default function PackageCard({ item }) {
  const {
    adultsIncluded,
    perks = {},
    meals = {},
    geniusDiscountPercent,
    geniusFreeBreakfast,
    ribbons = [],
    wasPriceUSD,
    priceUSD,
    taxesAndChargesUSD,
    startDate,
    endDate,
    isActive,
    createdAt,
  } = item || {};

  return (
    <div
      className="package-card"
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        gap: 16,
        background: isActive ? "#f0f0f0" : "#f8fafc",
        boxShadow: "0 1px 2px rgba(0,0,0,.04)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {ribbons?.map((r, i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                padding: "4px 8px",
                background: "#eef2ff",
                color: "#3730a3",
                borderRadius: 999,
              }}
            >
              {r}
            </span>
          ))}
          {geniusDiscountPercent > 0 && (
            <span style={{ fontSize: 12, padding: "4px 8px", background: "#ecfeff", color: "#155e75", borderRadius: 999 }}>
              Genius {geniusDiscountPercent}% off
            </span>
          )}
          {geniusFreeBreakfast && (
            <span style={{ fontSize: 12, padding: "4px 8px", background: "#ecfdf5", color: "#065f46", borderRadius: 999 }}>
              Free breakfast
            </span>
          )}
          {!isActive && (
            <span style={{ fontSize: 12, padding: "4px 8px", background: "#fee2e2", color: "#991b1b", borderRadius: 999 }}>
              Inactive
            </span>
          )}
        </div>

        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0a0a0a" }}>
          Package for {adultsIncluded ?? 2} adult{(adultsIncluded ?? 2) > 1 ? "s" : ""}
        </h3>

        {(startDate || endDate) && (
          <p style={{ margin: "6px 0", fontSize: 13, color: "#475569" }}>
            {startDate ? new Date(startDate).toLocaleDateString() : "—"} →{" "}
            {endDate ? new Date(endDate).toLocaleDateString() : "—"}
          </p>
        )}

        <ul style={{ margin: "8px 0", paddingLeft: 18, fontSize: 14, color: "#0a0a0a" }}>
          {perks?.freeCancellationAnytime && <li>Free cancellation anytime</li>}
          {perks?.noPrepaymentNeeded && <li>No prepayment needed</li>}
          {perks?.noCreditCardNeeded && <li>No credit card needed</li>}
          {meals?.breakfastIncluded && <li>Breakfast included</li>}
          {meals?.lunchPriceUSD > 0 && <li>Lunch: {currency(meals.lunchPriceUSD)}</li>}
          {meals?.dinnerPriceUSD > 0 && <li>Dinner: {currency(meals.dinnerPriceUSD)}</li>}
        </ul>

        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
          Added: {createdAt ? new Date(createdAt).toLocaleString() : "-"}
        </p>
      </div>

      <div style={{ minWidth: 220, textAlign: "right" }}>
        {wasPriceUSD > 0 && (
          <div style={{ fontSize: 14, color: "#64748b", textDecoration: "line-through" }}>
            {currency(wasPriceUSD)}
          </div>
        )}
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0a0a0a" }}>{currency(priceUSD)}</div>
        {taxesAndChargesUSD > 0 && (
          <div style={{ fontSize: 12, color: "#64748b" }}>
            + {currency(taxesAndChargesUSD)} taxes & charges
          </div>
        )}
      </div>
    </div>
  );
}
