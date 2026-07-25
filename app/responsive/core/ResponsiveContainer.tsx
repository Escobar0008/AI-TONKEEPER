"use client";

import "./responsive.css";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveContainer({
  children,
  className = "",
}: ResponsiveContainerProps) {
  return (
    <div className={`responsive-container ${className}`}>
      {children}
    </div>
  );
}