import type { Metadata } from "next";
import ScreenLayout from "@/components/ScreenLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review CCraft Studio terms for platform use, user content responsibilities, moderation, and service updates.",
  openGraph: {
    title: "Terms of Service | CCraft Studio",
    description:
      "Review CCraft Studio terms for platform use, user content responsibilities, moderation, and service updates.",
    url: "/tos",
    images: ["/images/icon.png"],
  },
};

export default function TermsOfServicePage() {
  return (
    <ScreenLayout>
      <section className="space-y-4">
        <div className="cardcb p-6">
          <h1 className="text-2xl font-semibold text-white">Terms of Service</h1>
          <p className="mt-2 text-sm text-white/80">Effective date: April 26, 2026</p>

          <div className="mt-6 space-y-5 text-sm text-white/90 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Use of Service</h2>
              <p>
                By using CCraft Studio, you agree to use the platform lawfully and respectfully,
                and to avoid uploading harmful, abusive, or unauthorized content.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">User Content</h2>
              <p>
                You are responsible for the projects and files you upload. You confirm you have the rights
                to share your content and grant us permission to host and display it on the platform.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Moderation</h2>
              <p>
                We may review, reject, or remove content that violates these terms or harms the community.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Availability</h2>
              <p>
                We aim to keep the service available, but uptime is not guaranteed and features may change over time.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Changes to Terms</h2>
              <p>
                We may update these terms as the platform evolves. Continued use of the service means you accept
                the latest version.
              </p>
            </section>
          </div>
        </div>
      </section>
    </ScreenLayout>
  );
}
