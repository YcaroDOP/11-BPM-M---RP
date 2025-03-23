import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import Navbar from "@/components/Navbar";
import { HierarchyMember, getHierarchyMembers, updateMember } from "@/utils/sheets";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { canEditSpreadsheet } from "@/utils/auth";

const SpreadsheetView = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<HierarchyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedMembers, setEditedMembers] = useState<HierarchyMember[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getHierarchyMembers();
        setMembers(data);
        setEditedMembers(JSON.parse(JSON.stringify(data)));
      } catch (error) {
        console.error("Error loading members:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados da planilha.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleEditToggle = () => {
    if (editMode) {
      // Reset edits when exiting edit mode
      setEditedMembers(JSON.parse(JSON.stringify(members)));
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (index: number, field: keyof HierarchyMember, value: string) => {
    const updated = [...editedMembers];
    updated[index] = { ...updated[index], [field]: value };
    setEditedMembers(updated);
  };

  const handleCursoChange = (index: number, curso: keyof HierarchyMember['cursos'], checked: boolean) => {
    const updated = [...editedMembers];
    updated[index] = { 
      ...updated[index], 
      cursos: { 
        ...updated[index].cursos, 
        [curso]: checked 
      } 
    };
    setEditedMembers(updated);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    
    try {
      // Find changed members
      const changedMembers = editedMembers.filter((member, index) => {
        return JSON.stringify(member) !== JSON.stringify(members[index]);
      });
      
      if (changedMembers.length === 0) {
        toast({
          title: "Nenhuma alteração",
          description: "Não foram detectadas alterações para salvar.",
        });
        setSaving(false);
        return;
      }
      
      // Update each changed member
      for (const member of changedMembers) {
        await updateMember(member);
      }
      
      // Refresh data
      const data = await getHierarchyMembers();
      setMembers(data);
      setEditedMembers(JSON.parse(JSON.stringify(data)));
      
      toast({
        title: "Alterações salvas",
        description: `${changedMembers.length} registro(s) atualizado(s) com sucesso.`,
      });
      
      setEditMode(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const canEdit = currentUser && canEditSpreadsheet(currentUser.role);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto pt-24 px-4 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold animate-fade-in">Visualização da Planilha</h1>
            <p className="text-muted-foreground animate-fade-in">
              Visualize e gerencie os dados da planilha em tempo real.
            </p>
          </div>
          
          {canEdit && (
            <div className="space-x-2 animate-fade-in">
              {editMode ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleEditToggle}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEditToggle}>
                  Editar Planilha
                </Button>
              )}
            </div>
          )}
        </div>
        
        <Tabs defaultValue="hierarchy" className="animate-fade-in">
          <TabsList className="mb-4">
            <TabsTrigger value="hierarchy">Hierarquia</TabsTrigger>
            <TabsTrigger value="absences">Ausências</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hierarchy">
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Discord</TableHead>
                      <TableHead>Patente</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead colSpan={7} className="text-center">Cursos</TableHead>
                      <TableHead>Como Entrou</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead colSpan={7}></TableHead>
                      <TableHead>SAT A</TableHead>
                      <TableHead>SAT B</TableHead>
                      <TableHead>T.B</TableHead>
                      <TableHead>T.A</TableHead>
                      <TableHead>MOD/BOPM</TableHead>
                      <TableHead>Abordagem</TableHead>
                      <TableHead>POP</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 15 }).map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton className="h-6 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : editedMembers.length > 0 ? (
                      editedMembers.map((member, index) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            {editMode ? (
                              <Input 
                                value={member.id} 
                                onChange={(e) => handleInputChange(index, 'id', e.target.value)}
                                className="h-8"
                              />
                            ) : member.id}
                          </TableCell>
                          <TableCell>
                            {editMode ? (
                              <Input 
                                value={member.serial || ''} 
                                onChange={(e) => handleInputChange(index, 'serial', e.target.value)}
                                className="h-8"
                              />
                            ) : member.serial || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {editMode ? (
                              <Input 
                                value={member.name} 
                                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                className="h-8"
                              />
                            ) : member.name}
                          </TableCell>
                          <TableCell>
                            {editMode ? (
                              <Input 
                                value={member.discord} 
                                onChange={(e) => handleInputChange(index, 'discord', e.target.value)}
                                className="h-8"
                              />
                            ) : member.discord}
                          </TableCell>
                          <TableCell>
                            {editMode ? (
                              <Input 
                                value={member.patente || 'SOLDADO DE 2ª CLASSE'} 
                                onChange={(e) => handleInputChange(index, 'patente', e.target.value)}
                                className="h-8"
                              />
                            ) : member.patente || 'SOLDADO DE 2ª CLASSE'}
                          </TableCell>
                          <TableCell>
                            {editMode ? (
                              <Input 
                                value={member.situacao || 'OPERACIONAL'} 
                                onChange={(e) => handleInputChange(index, 'situacao', e.target.value)}
                                className="h-8"
                              />
                            ) : member.situacao || 'OPERACIONAL'}
                          </TableCell>
                          <TableCell>
                            {editMode ? (
                              <Input 
                                type="date"
                                value={member.entrada} 
                                onChange={(e) => handleInputChange(index, 'entrada', e.target.value)}
                                className="h-8"
                              />
                            ) : member.entrada ? new Date(member.entrada).toLocaleDateString('pt-BR') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-center">
                            {editMode ? (
                              <Checkbox 
                                checked={member.cursos.satA} 
                                onCheckedChange={(checked) => handleCursoChange(index, 'satA', checked as boolean)}
                              />
                            ) : (
                              member.cursos.satA ? '✓' : '✗'
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {editMode ? (
                              <Checkbox 
                                checked={member.cursos.satB} 
                                onCheckedChange={(checked) => handleCursoChange(index, 'satB', checked as boolean)}
                              />
                            ) : (
                              member.cursos.satB ? '✓' : '✗'
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {editMode ? (
                              <Checkbox 
                                checked={member.cursos.tb} 
                                onCheckedChange={(checked) => handleCursoChange(index, 'tb', checked as boolean)}
                              />
                            ) : (
                              member.cursos.tb ? '✓' : '✗'
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {editMode ? (
                              <Checkbox 
                                checked={member.cursos.ta} 
                                onCheckedChange={(checked) => handleCursoChange(index, 'ta', checked as boolean)}
                              />
                            ) : (
                              member.cursos.ta ? '✓' : '✗'
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {editMode ? (
                              <Checkbox 
                                checked={member.cursos.modBopm} 
                                onCheckedChange={(checked) => handleCursoChange(index, 'modBopm', checked as boolean)}
                              />
                            ) : (
                              member.cursos.modBopm ? '✓' : '✗'
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {editMode ? (
                              <Checkbox 
                                checked={member.cursos.abordagem} 
                                onCheckedChange={(checked) => handleCursoChange(index, 'abordagem', checked as boolean)}
                              />
                            ) : (
                              member.cursos.abordagem ? '✓' : '✗'
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {editMode ? (
                              <Checkbox 
                                checked={member.cursos.pop} 
                                onCheckedChange={(checked) => handleCursoChange(index, 'pop', checked as boolean)}
                              />
                            ) : (
                              member.cursos.pop ? '✓' : '✗'
                            )}
                          </TableCell>
                          <TableCell>
                            {editMode ? (
                              <Input 
                                value={member.comoEntrou || ''} 
                                onChange={(e) => handleInputChange(index, 'comoEntrou', e.target.value)}
                                className="h-8"
                              />
                            ) : member.comoEntrou || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={15} className="text-center py-6 text-muted-foreground">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="absences">
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Discord</TableHead>
                      <TableHead>Patente</TableHead>
                      <TableHead>Último Ponto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 6 }).map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton className="h-6 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : members.length > 0 ? (
                      members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.id}</TableCell>
                          <TableCell>{member.serial || 'N/A'}</TableCell>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.discord}</TableCell>
                          <TableCell>{member.patente || 'SOLDADO DE 2ª CLASSE'}</TableCell>
                          <TableCell>{new Date().toLocaleDateString('pt-BR')}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SpreadsheetView;