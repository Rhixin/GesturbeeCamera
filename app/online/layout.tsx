"use client";

import Navigation from "@/components/Navigation";

export default function OnlineLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-5">{children}</main>
    </>
  );
}
