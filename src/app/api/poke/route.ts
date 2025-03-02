import { NextRequest, NextResponse } from 'next/server'
import { addUser, removeUser, getConnectedUsers } from '../../../stores/usersStore';
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: "1950934",
  key: "96e5da380a39b336f2a0",
  secret: "fef31a4a28bb66c38126",
  cluster: "us2",
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const { from, to, fromName  } = await req.json();

  if (!from || !to || !fromName) {
    return new Response(JSON.stringify({ error: "Emails inválidos!" }), {
      status: 400,
    });
  }

  // Envia a cutucada via Pusher
  await pusher.trigger("my-channel", "poke-received", {
    from,
    to,
    fromName,
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}