"use client";

import Navigation from "@/components/Navigation";
import { useState } from "react";

export default function OnlineLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mode, setMode] = useState("online");
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 mt-5">{children}</main>
    </>
  );
}
