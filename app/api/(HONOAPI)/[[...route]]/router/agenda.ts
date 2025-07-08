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

agenda.get("/", async (c) => {
  const date = c.req.query("date"); 
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");
  
  const col = await getAgendaCollection();
  let filter: any = {};
  
  if (date) {
    filter.date = date;
  } else if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }
  
  const list = await col.find(filter).sort({ date: 1, time: 1 }).toArray();
  return c.json(list);
});

export interface Appointment {
  _id?: string;
  date: string; 
  time: string; 
  title: string;
  completed?: boolean;
  clientId: string;
  clientName: string;
  value: number;
  note?: string;
  duration?: number;
}

agenda.post("/", async (c) => {
  const data = (await c.req.json()) as Appointment;
  const { date, time, title, clientId, clientName, value, duration = 60 } = data;
  
  if (!date || !time || !title || !clientId || !clientName || value == null) 
    return c.json("Dados incompletos", 400);

  const [h] = time.split(":");
  const hour = parseInt(h, 10);
  if (hour < 7 || hour > 22) return c.json("Horário inválido", 400);

  const col = await getAgendaCollection();
  
  // Calcular horário de término
  const startTime = new Date(`${date}T${time}:00`);
  const endTime = new Date(startTime.getTime() + (duration * 60000));
  const endTimeStr = endTime.toTimeString().substring(0, 5);
  
  // Verificar conflitos
  const existing = await col.findOne({
    date,
    $or: [
      { time: time },
      {
        time: { $lt: endTimeStr },
        $expr: {
          $gt: [
            {
              $dateFromString: {
                dateString: { $concat: ["$date", "T", "$time", ":00"] }
              }
            },
            startTime
          ]
        }
      }
    ]
  });
  
  if (existing) return c.json("Conflito de horário", 400);

  const { _id: _ignored, ...rest } = data;
  const result = await col.insertOne({ ...rest, completed: false });
  return c.json({ insertedId: result.insertedId }, 201);
});

agenda.put("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json("ID inválido", 400);
  
  const data = (await c.req.json()) as Appointment;
  const { date, time, title, clientId, clientName, value, note, duration = 60 } = data;
  
  if (!date || !time || !title || !clientId || !clientName || value == null) 
    return c.json("Dados incompletos", 400);

  const col = await getAgendaCollection();
  
  const existingAppointment = await col.findOne({ _id: id });
  if (!existingAppointment) return c.json("Agendamento não encontrado", 404);
  
  // Calcular horário de término
  const startTime = new Date(`${date}T${time}:00`);
  const endTime = new Date(startTime.getTime() + (duration * 60000));
  const endTimeStr = endTime.toTimeString().substring(0, 5);
  
  // Verificar conflitos, excluindo o próprio agendamento
  const existing = await col.findOne({
    date,
    _id: { $ne: id },
    $or: [
      { time: time },
      {
        time: { $lt: endTimeStr },
        $expr: {
          $gt: [
            {
              $dateFromString: {
                dateString: { $concat: ["$date", "T", "$time", ":00"] }
              }
            },
            startTime
          ]
        }
      }
    ]
  });
  
  if (existing) return c.json("Conflito de horário", 400);

  const result = await col.updateOne(
    { _id: id },
    { $set: { date, time, title, clientId, clientName, value, note, duration } }
  );
  
  if (!result.matchedCount) return c.json("Agendamento não encontrado", 404);
  return c.json({ success: true });
});

agenda.patch("/:id/complete", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json("ID inválido", 400);
  const col = await getAgendaCollection();
  const result = await col.updateOne({ _id: id }, { $set: { completed: true } });
  if (!result.matchedCount) return c.json("Agendamento não encontrado", 404);
  return c.json({ success: true });
});

agenda.delete("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json("ID inválido", 400);
  const col = await getAgendaCollection();
  const result = await col.deleteOne({ _id: id });
  if (!result.deletedCount) return c.json("Agendamento não encontrado", 404);
  return c.json({ success: true });
});

export { agenda };