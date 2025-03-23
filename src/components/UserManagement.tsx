import { useState, useEffect } from "react";
import { useAuth, User, UserRole } from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { canViewAllUsers } from "@/utils/auth";

const UserManagement = () => {
  const { users, createUser, updatePassword, currentUser } = useAuth();
  const { toast } = useToast();
  
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "adm_hierarquia" as UserRole
  });
  
  const [changePassword, setChangePassword] = useState({
    username: "",
    newPassword: ""
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  useEffect(() => {
    if (currentUser && canViewAllUsers(currentUser.role)) {
      setFilteredUsers(users.filter(user => user.username !== "Ycaro_Gutierrez"));
    } else {
      setFilteredUsers([]);
    }
  }, [users, currentUser]);
  
  if (!currentUser) {
    return null;
  }
  
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Erro",
        description: "Nome de usuário e senha são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const success = createUser(newUser.username, newUser.password, newUser.role);
    
    if (success) {
      toast({
        title: "Usuário criado",
        description: `O usuário ${newUser.username} foi criado com sucesso.`
      });
      
      setNewUser({
        username: "",
        password: "",
        role: "adm_hierarquia" as UserRole
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar o usuário. Verifique se o nome já existe.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!changePassword.username || !changePassword.newPassword) {
      toast({
        title: "Erro",
        description: "Nome de usuário e nova senha são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const success = updatePassword(changePassword.username, changePassword.newPassword);
    
    if (success) {
      toast({
        title: "Senha atualizada",
        description: `A senha do usuário ${changePassword.username} foi atualizada com sucesso.`
      });
      
      setChangePassword({
        username: "",
        newPassword: ""
      });
      
      setOpenDialog(false);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a senha. Verifique suas permissões.",
        variant: "destructive"
      });
    }
  };
  
  const handleSelectUser = (username: string) => {
    setChangePassword({
      ...changePassword,
      username
    });
    setOpenDialog(true);
  };
  
  const isCoordinator = currentUser.role === 'coordenador';
  const canViewUsers = currentUser && canViewAllUsers(currentUser.role);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {isCoordinator && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Usuário</CardTitle>
            <CardDescription>
              Crie um novo usuário com permissões específicas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Nome de usuário"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Senha"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser({...newUser, role: value as UserRole})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="adm_rso">ADM RSO</SelectItem>
                    <SelectItem value="adm_hierarquia">ADM Hierarquia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="mt-4">Criar Usuário</Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {canViewUsers && (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Usuários</CardTitle>
            <CardDescription>
              Visualize e gerencie os usuários do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome de Usuário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {user.role === "coordenador" && "Coordenador"}
                      {user.role === "supervisor" && "Supervisor"}
                      {user.role === "adm_rso" && "ADM RSO"}
                      {user.role === "adm_hierarquia" && "ADM Hierarquia"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSelectUser(user.username)}
                      >
                        Alterar Senha
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite a nova senha para o usuário {changePassword.username}.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={changePassword.newPassword}
                onChange={(e) => setChangePassword({...changePassword, newPassword: e.target.value})}
                placeholder="Nova senha"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;