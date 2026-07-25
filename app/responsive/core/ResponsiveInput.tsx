"use client";

import "./responsive.css";
import { InputHTMLAttributes } from "react";

export default function ResponsiveInput(
  props: InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={`responsive-input ${props.className || ""}`}
    />
  );
}