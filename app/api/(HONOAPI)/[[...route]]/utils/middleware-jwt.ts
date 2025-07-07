import { getCookie } from "hono/cookie";
import { validarToken } from "./jwt";

export async function authMiddleware(c: any, next: () => Promise<void>) {
    // const rawToken = c.req.header('Authorization');
    // const token = rawToken?.split(' ')[1];
    // if (!token) {
    //   return c.json({ message: 'Token não fornecido' }, 401);
    // }
  
    // try {
    //   const isValid = await validarToken(token);
    //   if (!isValid) {
    //     return c.json({ message: 'Token inválido ou expirado' }, 401);
    //   }
    // } catch {
    //   return c.json({ message: 'Token inválido ou expirado' }, 401);
    // }

    const token = getCookie(c, "token");
    if(!token){
      return c.json({ message: 'Token nao fornecido' }, 401);
    }

    try {
      const isValid = await validarToken(token);
      if (!isValid) {
        return c.json({ message: 'Token invalido ou expirado' }, 401);
      }
    } catch {
      return c.json({ message: 'Token invalido ou expirado' }, 401);
    }
  
    await next();
  }
  