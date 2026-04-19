import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function syncCurrentUserToDatabase() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return null;
    }

    const primaryEmail =
        clerkUser.emailAddresses.find(
            (email) => email.id === clerkUser.primaryEmailAddressId,
        )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
        throw new Error("The authenticated Clerk user does not have an email address.");
    }

    return prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {
            email: primaryEmail,
            firstName: clerkUser.firstName ?? null,
            lastName: clerkUser.lastName ?? null,
            imageUrl: clerkUser.imageUrl ?? null,
        },
        create: {
            clerkId: clerkUser.id,
            email: primaryEmail,
            firstName: clerkUser.firstName ?? null,
            lastName: clerkUser.lastName ?? null,
            imageUrl: clerkUser.imageUrl ?? null,
        },
    });
}
