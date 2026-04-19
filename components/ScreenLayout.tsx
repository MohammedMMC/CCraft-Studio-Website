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

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} CCraft Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}