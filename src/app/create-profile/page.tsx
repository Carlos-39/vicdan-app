"use client";

import { NewProfileForm } from "@/components/new-profile-form";
import { DashboardHeader } from "@/app/(dashboard)/dashboard/components/dashboard-header";
import { BottomNavigation } from "@/app/(dashboard)/dashboard/components/bottom-navigation";

export default function CreateProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <NewProfileForm />
      </main>
      <BottomNavigation activeTab="dashboard" />
    </div>
  );
}
