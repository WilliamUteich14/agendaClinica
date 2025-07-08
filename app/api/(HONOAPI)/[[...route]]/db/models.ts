export interface User {
  _id?: string; // ObjectID -> MongoDB
  id?: string;  
  name?: string;
  email: string;
  password?: string; 
  role?: 'admin' | 'staff' | string;
  active?: "true" | "false" | boolean;
}
export interface Client {
  _id?: string; // ObjectID MongoDB
  name: string;
  email: string;
  phone?: string;  
  address?: string;
  cpf?: string;
  birthDate?: string;       
  medicalHistory?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  active?: boolean | string;  
}

export interface Agenda {
    _id?: string; // ObjectID -> MongoDB
    title: string;
    description: string;
    date: Date;
    user: string; //User
    client: string; //Client
}

