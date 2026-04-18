import ScreenLayout from "../../components/ScreenLayout";

export default function CommunityPage() {
  return (
    <ScreenLayout
      title="Community Page"
      description="Starter area for posts, updates, and community activity."
    >
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Community Feed</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Place your post list, events, or announcements in this section.
        </p>
      </section>
    </ScreenLayout>
  );
}