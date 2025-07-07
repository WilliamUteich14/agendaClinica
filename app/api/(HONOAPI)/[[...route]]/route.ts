import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { users } from './router/users'
import { auth } from './router/auth'

const app = new Hono().basePath('/api/agendamento')
app.route('/auth', auth)
app.route('/users', users)


export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)