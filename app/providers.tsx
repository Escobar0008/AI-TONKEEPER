"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { ReactNode } from "react";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}