import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { users } from './router/users'
import { auth } from './router/auth'
import { clients } from './router/clients'
import { agenda } from './router/agenda'

const app = new Hono().basePath('/api/agendamento')
app.route('/auth', auth)
app.route('/users', users)
app.route('/clients', clients)
app.route('/agenda', agenda)


export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)