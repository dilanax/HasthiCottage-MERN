import React from "react";

export default function Badge({ children, tone = "success" }) {
  const cls =
    tone === "success"
      ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
      : tone === "warn"
      ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
      : "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold";

  return <span className={cls}>{children}</span>;
}
