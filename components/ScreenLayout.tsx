import type { ReactNode } from "react";
import Modal from "./Modal";
import Navbar from "./Navbar";

type ScreenLayoutProps = {
  children?: ReactNode;
};

export default function ScreenLayout({
  children,
}: ScreenLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {children}
      </main>

      <Modal
        open={false}
        title="Reusable Modal"
        description="This modal component is scaffolded and ready for future interactions."
      />
    </div>
  );
}