import React from "react";

const Badge = ({ children }) => (
  <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-black/40 border border-white/20">
    {children}
  </span>
);

export default function UserNotification({ notification, onClick }) {
  return (
    <div
      role="button"
      onClick={onClick}
      className="w-full bg-[#7a7979] text-gray-100 p-4 rounded-lg border border-white card-shadow transition-colors duration-200 hover:bg-[#1a1a1a] cursor-pointer"
    >
      <h3 className="text-[16px] mb-2 pb-1 border-b border-white/20 font-semibold">
        {notification?.title ?? "Untitled"}
      </h3>
      <p className="text-[13px] leading-[1.35]">
        {notification?.message ?? ""}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {notification?.type && <Badge>{notification.type}</Badge>}
        {notification?.priority && <Badge>{notification.priority}</Badge>}
      </div>
    </div>
  );
}
