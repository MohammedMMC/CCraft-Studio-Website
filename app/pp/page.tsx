import type { Metadata } from "next";
import ScreenLayout from "@/components/ScreenLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how CCraft Studio collects, uses, and protects account and project data across the platform.",
  openGraph: {
    title: "Privacy Policy | CCraft Studio",
    description:
      "Read how CCraft Studio collects, uses, and protects account and project data across the platform.",
    url: "/pp",
    images: ["/images/icon.png"],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <ScreenLayout>
      <section className="space-y-4">
        <div className="cardcb p-6">
          <h1 className="text-2xl font-semibold text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-white/80">Effective date: April 26, 2026</p>

          <div className="mt-6 space-y-5 text-sm text-white/90 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">What We Collect</h2>
              <p>
                We collect account details required to provide the service, project content you upload,
                and basic usage data needed for security and product maintenance.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">How We Use Data</h2>
              <p>
                We use data to operate the platform, keep your projects accessible, moderate content,
                improve reliability, and prevent abuse.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Data Sharing</h2>
              <p>
                We do not sell personal data. Data may be processed by trusted service providers that help
                us run the platform, such as hosting and authentication services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Your Choices</h2>
              <p>
                You can update or remove your content from your account. You may also request account-related
                help from the project administrators.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Contact</h2>
              <p>
                For privacy questions, contact the CCraft Studio team through the developer email contact@moma.dev.
              </p>
            </section>
          </div>
        </div>
      </section>
    </ScreenLayout>
  );
}
