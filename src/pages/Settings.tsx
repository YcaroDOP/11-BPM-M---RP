import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import Navbar from "@/components/Navbar";
import UserManagement from "@/components/UserManagement";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MoonIcon, SunIcon, LayoutGrid, Lock, Users } from "lucide-react";

const Settings = () => {
  const { isAuthenticated, currentUser, updatePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
    // Reset form on component mount
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, []);
  
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/" />;
  }
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }
    
    // Simple verification of current password (in a real app this would be more secure)
    const foundUser = currentUser.password === currentPassword;
    
    if (!foundUser) {
      toast({
        title: "Senha atual incorreta",
        description: "A senha atual informada está incorreta.",
        variant: "destructive",
      });
      return;
    }
    
    const success = updatePassword(currentUser.username, newPassword);
    
    if (success) {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-6xl mx-auto pt-24 px-4 pb-12">
        <h1 className="text-3xl font-bold mb-2 animate-fade-in">Configurações</h1>
        <p className="text-muted-foreground mb-8 animate-fade-in">
          Gerencie suas preferências e configurações do sistema.
        </p>
        
        <Tabs defaultValue="appearance" className="animate-fade-in">
          <TabsList className="mb-8">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" /> Aparência
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Segurança
            </TabsTrigger>
            {(currentUser.role === 'supervisor' || currentUser.role === 'coordenador') && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Usuários
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Tema</CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Modo de Exibição</Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setTheme("light")}
                    >
                      <SunIcon className="h-5 w-5 mr-2" />
                      Modo Claro
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setTheme("dark")}
                    >
                      <MoonIcon className="h-5 w-5 mr-2" />
                      Modo Escuro
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Altere sua senha de acesso ao sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                  
                  <Button type="submit" className="mt-4">
                    Alterar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {(currentUser.role === 'supervisor' || currentUser.role === 'coordenador') && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;