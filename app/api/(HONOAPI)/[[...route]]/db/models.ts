export interface User {
    _id?: string; // ObjectID -> MongoDB
    email: string;
    password: string;
}

export interface Client {
    _id?: string; // ObjectID -> MongoDB
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export interface Agenda {
    _id?: string; // ObjectID -> MongoDB
    title: string;
    description: string;
    date: Date;
    user: string; //User
    client: string; //Client
}

