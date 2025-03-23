import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const success = login(username, password);

      if (!success) {
        toast({
          title: "Falha no login",
          description: "Nome de usuário ou senha incorretos.",
          variant: "destructive",
        });
      }

      setIsLoading(false);
    }, 500);
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-center bg-no-repeat opacity-5"></div>
      </div>

      <div className="relative w-full max-w-md p-4 animate-fade-in">
        <Card className="backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold">Sistema de Registro</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  placeholder="Digite seu nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            <p className="w-full">
              Use suas credenciais fornecidas pela coordenação.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;