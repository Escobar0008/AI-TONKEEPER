import "./responsive.css";
import { ReactNode } from "react";

export default function ResponsiveLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="responsive-container">
      {children}
    </div>
  );
}