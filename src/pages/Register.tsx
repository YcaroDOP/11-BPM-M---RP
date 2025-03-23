import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import Navbar from "@/components/Navbar";
import MemberForm from "@/components/MemberForm"; // ✅ Certifique-se de que o caminho está correto!
import { canManageRegistration } from "@/utils/auth";

const Register = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [refresh, setRefresh] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const hasPermission = currentUser && canManageRegistration(currentUser.role);

  const handleMemberRegistered = () => {
    setRefresh(!refresh); // Atualiza a Dashboard sem piscar
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-6xl mx-auto pt-24 px-4 pb-12">
        <h1 className="text-3xl font-bold mb-2 animate-fade-in">Registro de Membros</h1>
        <p className="text-muted-foreground mb-8 animate-fade-in">
          {hasPermission 
            ? "Registre novos membros na hierarquia do batalhão." 
            : "Você não tem permissão para registrar novos membros."}
        </p>
        
        {/* Só exibe o formulário se o usuário tiver permissão */}
        {hasPermission ? (
          <MemberForm onMemberRegistered={handleMemberRegistered} key={refresh} />
        ) : (
          <p className="text-center text-red-500 font-semibold">
            Você não tem permissão para registrar membros.
          </p>
        )}
      </main>
    </div>
  );
};

// ✅ Exportação correta para evitar erro no App.tsx
export default Register;
