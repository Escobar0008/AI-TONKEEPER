"use client";

import React from "react";

export default function ResponsiveButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-80 transition"
    >
      {children}
    </button>
  );
}