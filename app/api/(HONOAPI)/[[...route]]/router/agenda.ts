import { Hono } from "hono";
import { authMiddleware } from "../utils/middleware-jwt";
import { getAgendaCollection } from "../db/db";
import { ObjectId } from "mongodb";

const agenda = new Hono();
agenda.use("*", authMiddleware);

// Utils
function parseId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

// GET /?date=YYYY-MM-DD  -> appointments for that day
agenda.get("/", async (c) => {
  const date = c.req.query("date"); // YYYY-MM-DD
  const col = await getAgendaCollection();
  let filter: any = {};
  if (date) {
    filter.date = date;
  }
  const list = await col.find(filter).sort({ time: 1 }).toArray();
  return c.json(list);
});

export interface Appointment {
  _id?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  completed?: boolean;
  clientId: string;
  clientName: string;
  value: number;
  note?: string;
}

agenda.post("/", async (c) => {
  const data = (await c.req.json()) as Appointment;
  const { date, time, title, clientId, clientName, value } = data;
  if (!date || !time || !title || !clientId || !clientName || value == null) return c.json("Dados incompletos", 400);

  // Validate time is between 07:00 and 23:00
  const [h] = time.split(":");
  const hour = parseInt(h, 10);
  if (hour < 7 || hour > 22) return c.json("Horário inválido", 400);

  const col = await getAgendaCollection();
  // Check overlap
  const existing = await col.findOne({ date, time });
  if (existing) return c.json("Horário já agendado", 400);

  const { _id: _ignored, ...rest } = data;
  const result = await col.insertOne({ ...rest, completed: false });
  return c.json({ insertedId: result.insertedId }, 201);
});

// PATCH /:id/complete  -> mark as completed
agenda.patch("/:id/complete", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json("ID inválido", 400);
  const col = await getAgendaCollection();
  const result = await col.updateOne({ _id: id }, { $set: { completed: true } });
  if (!result.matchedCount) return c.json("Agendamento não encontrado", 404);
  return c.json({ success: true });
});

export { agenda };
