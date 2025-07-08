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

// Formatar resposta para o frontend
function formatAppointment(appointment: any) {
  return {
    ...appointment,
    _id: appointment._id.toString(),
    clientId: appointment.clientId.toString()
  };
}

function prepareAppointmentData(data: any) {
  const { _id, clientId, ...rest } = data;
  return {
    ...rest,
    clientId: new ObjectId(clientId)
  };
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
  
  // Formatar para o frontend
  const formattedList = list.map(formatAppointment);
  return c.json(formattedList);
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
    return c.json({ error: "Dados incompletos" }, 400);

  const [h] = time.split(":");
  const hour = parseInt(h, 10);
  if (hour < 7 || hour > 22) return c.json({ error: "Horário inválido" }, 400);

  const col = await getAgendaCollection();
  
  // Calcular horário de término
  const startTime = new Date(`${date}T${time}:00`);
  const endTime = new Date(startTime.getTime() + (duration * 60000));
  
  // Verificar conflitos (abordagem simplificada)
  const conflictingAppointments = await col.find({
    date,
    $or: [
      {
        $and: [
          { time: { $lte: time } },
          { 
            $expr: {
              $gt: [
                {
                  $add: [
                    { $toLong: { $dateFromString: { dateString: { $concat: ["$date", "T", "$time", ":00"] } } } },
                    { $multiply: ["$duration", 60000] }
                  ]
                },
                startTime.getTime()
              ]
            }
          }
        ]
      },
      {
        time: { $gte: time },
        $expr: {
          $lt: [
            { $toLong: { $dateFromString: { dateString: { $concat: ["$date", "T", "$time", ":00"] } } } },
            endTime.getTime()
          ]
        }
      }
    ]
  }).toArray();

  if (conflictingAppointments.length > 0) {
    return c.json({ error: "Conflito de horário" }, 400);
  }

  // Preparar dados para inserção
  const insertData = prepareAppointmentData(data);

  const result = await col.insertOne({ 
    ...insertData,
    completed: false
  });
  
  // Buscar o agendamento inserido
  const newAppointment = await col.findOne({ _id: result.insertedId });
  return c.json(formatAppointment(newAppointment), 201);
});

agenda.put("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ error: "ID inválido" }, 400);
  
  const data = (await c.req.json()) as Appointment;
  const { date, time, title, clientId, clientName, value, note, duration = 60 } = data;
  
  if (!date || !time || !title || !clientId || !clientName || value == null) 
    return c.json({ error: "Dados incompletos" }, 400);

  const col = await getAgendaCollection();
  
  const existingAppointment = await col.findOne({ _id: id });
  if (!existingAppointment) return c.json({ error: "Agendamento não encontrado" }, 404);
  
  // Verificar conflitos (excluindo o próprio agendamento)
  const conflictingAppointments = await col.find({
    _id: { $ne: id },
    date,
    $or: [
      {
        $and: [
          { time: { $lte: time } },
          { 
            $expr: {
              $gt: [
                {
                  $add: [
                    { $toLong: { $dateFromString: { dateString: { $concat: ["$date", "T", "$time", ":00"] } } } },
                    { $multiply: ["$duration", 60000] }
                  ]
                },
                new Date(`${date}T${time}:00`).getTime()
              ]
            }
          }
        ]
      },
      {
        time: { $gte: time },
        $expr: {
          $lt: [
            { $toLong: { $dateFromString: { dateString: { $concat: ["$date", "T", "$time", ":00"] } } } },
            new Date(`${date}T${time}:00`).getTime() + (duration * 60000)
          ]
        }
      }
    ]
  }).toArray();

  if (conflictingAppointments.length > 0) {
    return c.json({ error: "Conflito de horário" }, 400);
  }

  // Preparar dados para atualização
  const updateData = prepareAppointmentData(data);

  const result = await col.updateOne(
    { _id: id },
    { $set: updateData }
  );
  
  if (!result.matchedCount) return c.json({ error: "Agendamento não encontrado" }, 404);
  
  // Retornar o agendamento atualizado
  const updatedAppointment = await col.findOne({ _id: id });
  return c.json(formatAppointment(updatedAppointment));
});

agenda.patch("/:id/complete", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ error: "ID inválido" }, 400);
  
  const col = await getAgendaCollection();
  const result = await col.updateOne(
    { _id: id }, 
    { $set: { completed: true } }
  );
  
  if (!result.matchedCount) return c.json({ error: "Agendamento não encontrado" }, 404);
  
  const updatedAppointment = await col.findOne({ _id: id });
  return c.json(formatAppointment(updatedAppointment));
});

agenda.delete("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return c.json({ error: "ID inválido" }, 400);
  
  const col = await getAgendaCollection();
  const appointment = await col.findOne({ _id: id });
  
  if (!appointment) return c.json({ error: "Agendamento não encontrado" }, 404);
  
  const result = await col.deleteOne({ _id: id });
  
  if (!result.deletedCount) return c.json({ error: "Falha ao excluir" }, 500);
  
  return c.json(formatAppointment(appointment));
});

export { agenda };