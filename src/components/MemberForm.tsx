import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { HierarchyMember, registerMember } from "@/utils/sheets";
import { useToast } from "@/components/ui/use-toast";
import { canManageRegistration } from "@/utils/auth";
import { useAuth } from "@/utils/auth";

const MemberForm = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<HierarchyMember>({
    id: "",
    serial: "",
    name: "",
    discord: "",
    entrada: new Date().toISOString().split('T')[0],
    cursos: {
      satA: false,
      satB: false,
      tb: false,
      ta: false,
      modBopm: false,
      abordagem: false,
      pop: false
    },
    comoEntrou: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCursoChange = (curso: keyof HierarchyMember['cursos'], checked: boolean) => {
    setFormData({
      ...formData,
      cursos: {
        ...formData.cursos,
        [curso]: checked
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.name || !formData.discord) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await registerMember(formData);
      
      if (success) {
        toast({
          title: "Membro registrado",
          description: "O membro foi registrado com sucesso.",
        });
        
        // Resetar o formulário
        setFormData({
          id: "",
          serial: "",
          name: "",
          discord: "",
          entrada: new Date().toISOString().split('T')[0],
          cursos: {
            satA: false,
            satB: false,
            tb: false,
            ta: false,
            modBopm: false,
            abordagem: false,
            pop: false
          },
          comoEntrou: ""
        });
      }
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: "Ocorreu um erro ao registrar o membro.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser || !canManageRegistration(currentUser.role)) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Você não tem permissão para registrar membros.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Registro de Membros</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para registrar um novo membro na hierarquia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">Número de Registro (ID):</Label>
              <Input id="id" name="id" placeholder="Ex: 141, 1223, 773" value={formData.id} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial">Serial (Opcional):</Label>
              <Input id="serial" name="serial" placeholder="Ex: RWE241, ZWP008, CUR203" value={formData.serial} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome:</Label>
            <Input id="name" name="name" placeholder="Ex: Kaique Ferreira, Ycaro Gutierrez, Henrique Junior" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discord">Discord ID:</Label>
            <Input id="discord" name="discord" placeholder="Ex: 719024332931858553" value={formData.discord} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entrada">Data de Entrada:</Label>
            <Input id="entrada" name="entrada" type="date" value={formData.entrada} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label>Cursos Concluídos:</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {Object.keys(formData.cursos).map((curso) => (
                <div key={curso} className="flex items-center space-x-2">
                  <Checkbox id={curso} checked={formData.cursos[curso as keyof HierarchyMember['cursos']]} 
                    onCheckedChange={(checked) => handleCursoChange(curso as keyof HierarchyMember['cursos'], checked as boolean)}
                  />
                  <Label htmlFor={curso} className="font-normal text-sm">{curso.toUpperCase()}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comoEntrou">Como entrou no batalhão (Opcional):</Label>
            <Input id="comoEntrou" name="comoEntrou" placeholder="Ex: Edital 54, Convite Direto, Reintegração, Integração" value={formData.comoEntrou} onChange={handleInputChange} />
          </div>

          <CardFooter className="px-0 pt-6">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Membro"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default MemberForm;