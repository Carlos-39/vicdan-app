import { NewProfileForm } from "@/components/new-profile-form";

export const metadata = {
  title: "Crear Perfil | Vicdan",
  description: "Crea un nuevo perfil con tu información básica",
};

export default function CreateProfilePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f3e8ff] to-white py-12 px-4">
      <NewProfileForm />
    </main>
  );
}
