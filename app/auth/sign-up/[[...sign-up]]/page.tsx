import { SignUp } from "@clerk/nextjs";
import ScreenLayout from "../../../../components/ScreenLayout";

export default function SignUpPage() {
  return (
    <ScreenLayout
      title="Create Account"
      description="Register and get started in your dashboard."
    >
      <section className="flex justify-center">
        <SignUp path="/auth/sign-up" routing="path" signInUrl="/auth/sign-in" />
      </section>
    </ScreenLayout>
  );
}
