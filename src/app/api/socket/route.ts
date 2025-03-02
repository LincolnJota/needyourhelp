import { NextRequest } from "next/server";
import {
  addUser,
  removeUser,
  getConnectedUsers,
} from "../../../stores/usersStore";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: "1950934",
  key: "96e5da380a39b336f2a0",
  secret: "fef31a4a28bb66c38126",
  cluster: "us2",
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const { email, name, event } = await req.json(); // Lê o corpo da requisição como JSON

  if (event === "connect") {

    // Quando um usuário se conecta, adicionamos ao array
    addUser({ email, name });
    pusher.trigger("my-channel", "user-connected", {
      users: getConnectedUsers(),
    });
    console.log("Usuário conectado: ", email);
  } else if (event === "disconnect") {
    // Quando um usuário se desconecta, removemos do array
    removeUser(email);
    pusher.trigger("my-channel", "user-disconnected", {
      users: getConnectedUsers(),
    });
    console.log("Usuário desconectado: ", email);
  }

  console.log("Usuários encontrados: ", getConnectedUsers());
  

  return new Response(JSON.stringify({ msg: "success" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
