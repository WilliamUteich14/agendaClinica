import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "./components/sidebar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    return redirect("/");
  }

  const res = await fetch(`${process.env.NEXT_URL}/api/agendamento/auth/verifyToken`, {
    headers: {
      Cookie: `token=${token}`,
    },
    cache: "no-store", 
  });

  if (!res.ok) {
    return redirect("/");
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <Sidebar>{children}</Sidebar>
      </body>
    </html>
  );
}
