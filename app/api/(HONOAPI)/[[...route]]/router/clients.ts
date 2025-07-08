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

function formatClient(client: any) {
  return {
    ...client,
    _id: client._id.toString()
  };
}

export const clients = new Hono();
clients.use('*', authMiddleware);

export interface Client {
  _id?: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  historico?: string;           
  allergies?: string;           
  emergencyContactName?: string; 
  emergencyContactPhone?: string; 
  active?: boolean;        
}

clients.get('/', async (c) => {
  const col = await getClientCollection();
  const list = await col.find().toArray();
  
  const formattedList = list.map(formatClient);
  return c.json(formattedList);
});

clients.get('/:id', async (c) => {
  const col = await getClientCollection();
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ error: 'ID inválido' }, 400);

  const client = await col.findOne({ _id: id });
  if (!client) return c.json({ error: 'Cliente não encontrado' }, 404);

  return c.json(formatClient(client));
});

clients.post('/', async (c) => {
  const data = await c.req.json();
  const col = await getClientCollection();

  const existingClient = await col.findOne({ email: data.email });
  if (existingClient) {
    return c.json({ error: 'Email já cadastrado' }, 400);
  }


  const result = await col.insertOne({
    ...data,
    active: true 
  });
  
  const newClient = await col.findOne({ _id: result.insertedId });
  return c.json(formatClient(newClient), 201);
});

clients.put('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ error: 'ID inválido' }, 400);

  const data = await c.req.json();
  const col = await getClientCollection();

  if (data.email) {
    const existingClient = await col.findOne({
      email: data.email,
      _id: { $ne: id }
    });
    
    if (existingClient) {
      return c.json({ error: 'Email já está em uso por outro cliente' }, 400);
    }
  }

  const result = await col.updateOne(
    { _id: id }, 
    { $set: data }
  );
  
  if (result.matchedCount === 0) {
    return c.json({ error: 'Cliente não encontrado' }, 404);
  }

  const updatedClient = await col.findOne({ _id: id });
  return c.json(formatClient(updatedClient));
});

clients.delete('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ error: 'ID inválido' }, 400);

  const col = await getClientCollection();
  const client = await col.findOne({ _id: id });

  if (!client) {
    return c.json({ error: 'Cliente não encontrado' }, 404);
  }

  // "Exclusão suave" - marcar como inativo
  const result = await col.updateOne(
    { _id: id },
    { $set: { active: false } }
  );

  if (result.modifiedCount === 0) {
    return c.json({ error: 'Falha ao desativar cliente' }, 500);
  }

  const updatedClient = await col.findOne({ _id: id });
  return c.json(formatClient(updatedClient));
});

// Rota para reativar cliente
clients.patch('/:id/reactivate', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ error: 'ID inválido' }, 400);

  const col = await getClientCollection();
  const client = await col.findOne({ _id: id });

  if (!client) {
    return c.json({ error: 'Cliente não encontrado' }, 404);
  }

  if (client.active === true) {
    return c.json({ error: 'Cliente já está ativo' }, 400);
  }

  const result = await col.updateOne(
    { _id: id },
    { $set: { active: true } }
  );

  if (result.modifiedCount === 0) {
    return c.json({ error: 'Falha ao reativar cliente' }, 500);
  }

  const updatedClient = await col.findOne({ _id: id });
  return c.json(formatClient(updatedClient));
});