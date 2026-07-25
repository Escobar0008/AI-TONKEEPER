"use client";

import ResponsiveContainer from "../responsive/ResponsiveContainer";
import ResponsiveGrid from "../responsive/ResponsiveGrid";
import ResponsiveCard from "../responsive/ResponsiveCard";
import ResponsiveButton from "../responsive/ResponsiveButton";
import ResponsiveInput from "../responsive/ResponsiveInput";

export default function ResponsiveDemoPage() {
  return (
    <ResponsiveContainer>
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">
        AI TONKEEPER V2
      </h1>

      <ResponsiveGrid>
        <ResponsiveCard>
          <h2 className="text-2xl font-bold mb-4">
            Dashboard
          </h2>

          <p className="mb-6">
            This is the new responsive system.
          </p>

          <ResponsiveInput placeholder="Search crypto..." />

          <div className="mt-4">
            <ResponsiveButton>
              Search
            </ResponsiveButton>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <h2 className="text-2xl font-bold mb-4">
            Portfolio
          </h2>

          <p>BTC</p>
          <p>ETH</p>
          <p>TON</p>
        </ResponsiveCard>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
}