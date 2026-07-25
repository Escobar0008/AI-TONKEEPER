"use client";

import "./responsive.css";
import { ReactNode } from "react";

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveCard({
  children,
  className = "",
}: ResponsiveCardProps) {
  return (
    <div className={`responsive-card ${className}`}>
      {children}
    </div>
  );
}