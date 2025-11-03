import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  return <SessionProvider>{children}</SessionProvider>;
}


