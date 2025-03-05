import { NextRequest } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const formData = Object.fromEntries(await req.formData());

  const socket_id = String(formData.socket_id);
  const email = String(formData.email);
  const name = String(formData.name);
  const avatar = String(formData.avatar);

  if (!email || !socket_id || !name || !avatar) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const authResponse = pusher.authenticateUser(socket_id, {
      id: email,
      userInfo: {
        email,
        name,
        avatar,
      },
    });

    return Response.json(authResponse);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "AuthError" }, { status: 403 });
  }
}
