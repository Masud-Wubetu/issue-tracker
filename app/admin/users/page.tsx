import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { Flex, Heading, Text } from "@radix-ui/themes";
import UserManagement from "./_components/UserManagement";
import { Metadata } from "next";

export const metadata: Metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return (
      <Flex direction="column" align="center" justify="center" mt="9" gap="3">
        <Heading size="6" color="red">Access Denied</Heading>
        <Text color="gray">You must be an Admin to view this page.</Text>
      </Flex>
    );
  }

  return <UserManagement />;
}
