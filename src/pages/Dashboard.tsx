import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHierarchyMembers, getAbsences, HierarchyMember, Absence } from "@/utils/sheets";
import Navbar from "@/components/Navbar";
import { ClipboardList, Users, UserCheck, Calendar, Clock } from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [members, setMembers] = useState<HierarchyMember[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false); // ✅ Corrigido: Agora refresh está definido

  useEffect(() => {
    const loadData = async () => {
      try {
        const [membersData, absencesData] = await Promise.all([
          getHierarchyMembers(),
          getAbsences()
        ]);
        
        setMembers(membersData);
        setAbsences(absencesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [refresh]); // ✅ Agora o useEffect pode monitorar refresh sem erro

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const totalMembers = members.length;
  const activeMembersCount = members.filter(m => m.situacao === "ATIVO" || m.situacao === "OPERACIONAL").length;
  
  // Obtém a data de hoje no formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const membersAddedToday = members.filter(m => m.entrada === today).length;

  // Formata a data como dd/mm/yyyy
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Obtém os últimos 5 membros registrados
  const recentMembers = [...members]
    .sort((a, b) => {
      if (!a.entrada || !b.entrada) return 0;
      return new Date(b.entrada).getTime() - new Date(a.entrada).getTime();
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto pt-24 px-4 pb-12">
        <h1 className="text-3xl font-bold mb-8 animate-fade-in">
          Bem-vindo(a), {currentUser?.username}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="animate-slide-in">
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Membros</p>
                <p className="text-3xl font-bold">{totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Membros Ativos</p>
                <p className="text-3xl font-bold">{activeMembersCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos Hoje</p>
                <p className="text-3xl font-bold">{membersAddedToday}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-in" style={{ animationDelay: "0.3s" }}>
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Último Registro</p>
                <p className="text-3xl font-bold">
                  {members.length > 0 
                    ? formatDate(members[members.length - 1]?.entrada || '')
                    : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="recent" className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <TabsList className="mb-4">
            <TabsTrigger value="recent">Registros Recentes</TabsTrigger>
            <TabsTrigger value="absences">Últimas Presenças</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  <span>Membros Recentemente Registrados</span>
                </CardTitle>
                <CardDescription>
                  Os últimos 5 membros registrados no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Carregando...
                  </div>
                ) : recentMembers.length > 0 ? (
                  <div className="space-y-4">
                    {recentMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between pb-4 border-b">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {member.id} | Serial: {member.serial || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{member.patente || "SOLDADO DE 2ª CLASSE"}</p>
                          <p className="text-sm text-muted-foreground">
                            Entrada: {formatDate(member.entrada || '')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhum membro registrado ainda.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
