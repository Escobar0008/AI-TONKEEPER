"use client";

import "./responsive.css";
import { ButtonHTMLAttributes } from "react";

export default function ResponsiveButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className={`responsive-button ${props.className || ""}`}
    />
  );
}