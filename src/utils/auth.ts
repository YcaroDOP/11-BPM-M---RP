import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'coordenador' | 'supervisor' | 'adm_rso' | 'adm_hierarquia';

export interface User {
  username: string;
  password: string;
  role: UserRole;
}

interface AuthState {
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createUser: (username: string, password: string, role: UserRole) => boolean;
  updatePassword: (username: string, newPassword: string) => boolean;
}

// Default admin user
const defaultUsers: User[] = [
  {
    username: 'Ycaro_Gutierrez',
    password: '110571',
    role: 'coordenador'
  }
];

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: defaultUsers,
      currentUser: null,
      isAuthenticated: false,
      
      login: (username, password) => {
        const user = get().users.find(
          (u) => u.username === username && u.password === password
        );
        
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        
        return false;
      },
      
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
      
      createUser: (username, password, role) => {
        const { users, currentUser } = get();
        
        // Check if current user has permission (only coordinator can create users)
        if (currentUser?.role !== 'coordenador') {
          return false;
        }
        
        // Check if username already exists
        if (users.some(u => u.username === username)) {
          return false;
        }
        
        const newUser = { username, password, role };
        set({ users: [...users, newUser] });
        return true;
      },
      
      updatePassword: (username, newPassword) => {
        const { users, currentUser } = get();
        
        // User can update their own password
        // Supervisor and coordinator can update any password
        const canUpdatePassword = 
          currentUser?.username === username || 
          currentUser?.role === 'supervisor' || 
          currentUser?.role === 'coordenador';
          
        if (!canUpdatePassword) {
          return false;
        }
        
        const updatedUsers = users.map(user => 
          user.username === username 
            ? { ...user, password: newPassword } 
            : user
        );
        
        set({ users: updatedUsers });
        return true;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Helper functions to check permissions
export const canViewAllUsers = (role: UserRole) => {
  return role === 'supervisor' || role === 'coordenador';
};

export const canManageRegistration = (role: UserRole) => {
  return role === 'coordenador' || role === 'adm_hierarquia';
};

export const canViewSpreadsheet = (role: UserRole) => {
  return true; // All roles can view the spreadsheet
};

export const canEditSpreadsheet = (role: UserRole) => {
  return role === 'coordenador' || role === 'supervisor';
};