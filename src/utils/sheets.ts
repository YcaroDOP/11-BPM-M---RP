import { toast } from "@/components/ui/use-toast";

// Mock data for spreadsheet hierarchy
export interface HierarchyMember {
  id: string;
  serial: string;
  name: string;
  discord: string;
  patente?: string;
  situacao?: string;
  entrada?: string;
  cursos: {
    satA: boolean;
    satB: boolean;
    tb: boolean;
    ta: boolean;
    modBopm: boolean;
    abordagem: boolean;
    pop: boolean;
  };
  comoEntrou?: string;
}

// Mock data for absence tracking
export interface Absence {
  id: string;
  serial: string;
  name: string;
  discord: string;
  patente: string;
  ultimoPonto: Date;
}

// Initial mock data
const initialMembers: HierarchyMember[] = [
  {
    id: "001",
    serial: "RWE241",
    name: "Ycaro Gutierrez",
    discord: "719024332931858553",
    patente: "COORDENADOR",
    situacao: "ATIVO",
    entrada: "2023-01-15",
    cursos: {
      satA: true,
      satB: true,
      tb: true,
      ta: true,
      modBopm: true,
      abordagem: true,
      pop: true
    },
    comoEntrou: "Fundador"
  },
  {
    id: "002",
    serial: "ZWP008",
    name: "Kaique Ferreira",
    discord: "789456123",
    patente: "SOLDADO DE 2ª CLASSE",
    situacao: "OPERACIONAL",
    entrada: "2023-06-20",
    cursos: {
      satA: true,
      satB: false,
      tb: false,
      ta: false,
      modBopm: false,
      abordagem: false,
      pop: false
    },
    comoEntrou: "Edital 54"
  }
];

const initialAbsences: Absence[] = [
  {
    id: "001",
    serial: "RWE241",
    name: "Ycaro Gutierrez",
    discord: "719024332931858553",
    patente: "COORDENADOR",
    ultimoPonto: new Date()
  },
  {
    id: "002",
    serial: "ZWP008",
    name: "Kaique Ferreira",
    discord: "789456123",
    patente: "SOLDADO DE 2ª CLASSE",
    ultimoPonto: new Date()
  }
];

// Store data in localStorage
const saveMembers = (members: HierarchyMember[]) => {
  localStorage.setItem('hierarchyMembers', JSON.stringify(members));
};

const saveAbsences = (absences: Absence[]) => {
  localStorage.setItem('absences', JSON.stringify(absences));
};

// Load data from localStorage or use initial data
const loadMembers = (): HierarchyMember[] => {
  const savedData = localStorage.getItem('hierarchyMembers');
  return savedData ? JSON.parse(savedData) : initialMembers;
};

const loadAbsences = (): Absence[] => {
  const savedData = localStorage.getItem('absences');
  return savedData ? JSON.parse(savedData) : initialAbsences;
};

// Mock API functions
export const getHierarchyMembers = (): Promise<HierarchyMember[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(loadMembers());
    }, 300);
  });
};

export const getAbsences = (): Promise<Absence[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(loadAbsences());
    }, 300);
  });
};

export const registerMember = (member: HierarchyMember): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const members = loadMembers();
      
      // Check if ID already exists
      if (members.some(m => m.id === member.id)) {
        toast({
          title: "Erro no registro",
          description: `Membro com ID ${member.id} já existe.`,
          variant: "destructive"
        });
        resolve(false);
        return;
      }
      
      // Add new member
      const newMember: HierarchyMember = {
        ...member,
        patente: "SOLDADO DE 2ª CLASSE",
        situacao: "OPERACIONAL"
      };
      
      const updatedMembers = [...members, newMember];
      saveMembers(updatedMembers);
      
      // Register absence
      const absences = loadAbsences();
      const newAbsence: Absence = {
        id: member.id,
        serial: member.serial,
        name: member.name,
        discord: member.discord,
        patente: "SOLDADO DE 2ª CLASSE",
        ultimoPonto: new Date()
      };
      
      const updatedAbsences = [...absences, newAbsence];
      saveAbsences(updatedAbsences);
      
      resolve(true);
    }, 500);
  });
};

export const updateMember = (updatedMember: HierarchyMember): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const members = loadMembers();
      const updatedMembers = members.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      );
      
      saveMembers(updatedMembers);
      resolve(true);
    }, 500);
  });
};

// In a real app, you would add Google Sheets API integration here
// For now, we're using localStorage to simulate the data storage