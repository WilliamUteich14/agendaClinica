import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "./components/sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  try {
    const validaLogin = await fetch(`${process.env.NEXT_URL}/api/agendamento/auth/verifyToken`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`, 
      },
    });

    if (!validaLogin.ok) {
      throw new Error("Token inválido ou expirado");
    }
  } catch (error) {
    try {
      await fetch(`${process.env.NEXT_URL}/api/agendamento/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `token=${token}`, 
        },
      });
    } catch (logoutError) {
      console.error("Falha ao tentar logout:", logoutError);
    }
    return redirect("/");
  }

  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <Sidebar>{children}</Sidebar>
      </body>
    </html>
  );
}
