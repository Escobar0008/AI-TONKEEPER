"use client";

import { ReactNode } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TonConnectUIProvider
      manifestUrl="https://ai-tonkeeper.vercel.app/tonconnect-manifest.json"
    >
      {children}
    </TonConnectUIProvider>
  );
}