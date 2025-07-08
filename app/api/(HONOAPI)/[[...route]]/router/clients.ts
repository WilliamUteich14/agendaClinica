import { Hono } from "hono";
import { getClientCollection } from "../db/db";
import { ObjectId } from "mongodb";
import { authMiddleware } from "../utils/middleware-jwt";

export function parseId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export const clients = new Hono();
clients.use('*', authMiddleware);

export interface Client {
  _id?: string; // ObjectID -> MongoDB
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  historico?: string;           
  allergies?: string;           
  emergencyContactName?: string; 
  emergencyContactPhone?: string; 
  active?: string;              
}

clients.get('/', async (c) => {
  const col = await getClientCollection();
  const list = await col.find().toArray();
  return c.json(list);
});

clients.get('/:id', async (c) => {
  const col = await getClientCollection();
  const id = parseId(c.req.param('id'));
  if (!id) return c.json('ID inválido', 400);

  const client = await col.findOne({ _id: id });
  if (!client) return c.json('Cliente não encontrado', 404);

  return c.json(client);
});

clients.post('/', async (c) => {
  const data = await c.req.json();
  const col = await getClientCollection();

  const client = await col.findOne({ email: data.email });
  if (client) return c.json('Email ja cadastrado', 400);

  const result = await col.insertOne(data);
  return c.json({ insertedId: result.insertedId }, 201);
});

clients.put('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json('ID inválido', 400);

  const data = await c.req.json();
  const col = await getClientCollection();

  const result = await col.updateOne({ _id: id }, { $set: data });
  if (result.matchedCount === 0) return c.json('Cliente não encontrado', 404);

  return c.json({ modifiedCount: result.modifiedCount });
});

clients.delete('/:id', async (c) => {
  const paramId = c.req.param('id');

  const id = parseId(paramId);
  if (!id) {
    return c.json({ error: 'ID inválido' }, 400);
  }

  const col = await getClientCollection();

  const client = await col.findOne({ _id: id });

  if (!client) {
    return c.json({ error: 'Cliente não encontrado' }, 404);
  }

  const result = await col.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    return c.json({ error: 'Falha ao excluir cliente' }, 500);
  }

  return c.json({ message: 'Cliente excluído com sucesso' });
});


//clients.put('/reactivate/:id', async (c) => {
//    const id = parseId(c.req.param('id'));
//    if (!id) return c.json({ error: 'ID inválido' }, 400);
//
//    const col = await getClientCollection();
//
//    const client = await col.findOne({ _id: id });
//
//    if (!client) return c.json({ error: 'Cliente não encontrado' }, 404);
//
//    if (client.active === true) return c.json({ error: 'Cliente já está ativo' }, 400);
//
//    const result =await col.updateOne({ _id: id }, { $set: { active: true } });
//
//    if (result.modifiedCount === 0) {
//      return c.json({ error: 'Falha ao reativar cliente' }, 500);
//    }
//    return c.json({ message: 'Cliente reativado com sucesso' });
//  });
//  