"use client";

import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <Navbar />
      <main style={{ marginTop: "clamp(4rem, 10vh, 7rem)" }}>
        {children}
      </main>
    </SessionProvider>
  );
}
