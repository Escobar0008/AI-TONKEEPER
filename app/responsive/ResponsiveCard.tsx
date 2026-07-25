"use client";

import React from "react";

export default function ResponsiveCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-4 shadow-sm bg-white">
      {children}
    </div>
  );
}