import { SignIn } from "@clerk/nextjs";
import ScreenLayout from "../../../../components/ScreenLayout";

export default function SignInPage() {
  return (
    <ScreenLayout>
      <section className="flex justify-center">
        <SignIn path="/auth/sign-in" routing="path" signUpUrl="/auth/sign-up" />
      </section>
    </ScreenLayout>
  );
}
