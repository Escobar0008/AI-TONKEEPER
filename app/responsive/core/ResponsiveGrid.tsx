"use client";

import "./responsive.css";
import { ReactNode } from "react";

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveGrid({
  children,
  className = "",
}: ResponsiveGridProps) {
  return (
    <div className={`responsive-grid ${className}`}>
      {children}
    </div>
  );
}