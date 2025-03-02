"use client";

import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { IconUser } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "@/stores/usersStore";
import { toast, ToastContainer } from "react-toastify";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [isUserSet, setIsUserSet] = useState(false);

  // Função para enviar dados do usuário para o servidor usando navigator.sendBeacon
  const sendUserInfoToServer = (email: string, name: string, event: string) => {
    const url = "/api/socket";
    const data = JSON.stringify({ email, name, event });

    // Verificar se a API beacon está disponível
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, data);
    } else {
      // Fallback para fetch caso o beacon não esteja disponível
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      });
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    if (storedEmail && storedName) {
      setEmail(storedEmail);
      setName(storedName);
      setIsUserSet(true);
      sendUserInfoToServer(storedEmail, storedName, "connect"); // Envia o evento de conexão para o servidor
    }

    // Fetch para buscar usuários conectados ao iniciar a página
    const fetchConnectedUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setConnectedUsers((prevUsers) => [
          ...prevUsers,
          ...data.users.filter((user: User) => user.email !== storedEmail),
        ]);
      } catch (error) {
        console.error("Erro ao buscar usuários conectados:", error);
      }
    };

    fetchConnectedUsers(); // Chama a função para buscar usuários conectados
  }, []);

  useEffect(() => {
    if (email && name) {
      const pusher = new Pusher("96e5da380a39b336f2a0", {
        cluster: "us2",
      });

      const channel = pusher.subscribe("my-channel");

      // Conectar o usuário e escutar outros eventos de usuários conectados
      channel.bind("user-connected", (data: { users: User[] }) => {
        console.log("Atualizando usuários (PUSHER):", data.users);

        setConnectedUsers(data.users);
      });

      channel.bind("user-disconnected", (data: { users: User[] }) => {
        console.log("Usuário desconectado (PUSHER):", data);

        const updatedUsers = data.users.filter(
          (user: User) => user.email !== email
        );
        setConnectedUsers(updatedUsers);
      });

      channel.bind("poke-received", (data: { fromName: string, to: string, from: string }) => {
        const myEmail = localStorage.getItem("userEmail");

        if (data.to.includes(myEmail!)) {
          console.log("Notificação recebida (PUSHER):", data);
          toast.warn(data.fromName + " está te chamando!", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          new Audio("/poke.mp3").play();
        }
      });

      // Usar o Beacon para notificar o servidor de desconexão
      const handleBeforeUnload = () => {
        sendUserInfoToServer(email, name!, "disconnect");
      };

      const handleUnload = () => {
        sendUserInfoToServer(email, name!, "disconnect");
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("unload", handleUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("unload", handleUnload);
      };
    }
  }, [email, name]);

  const sendNotification = (email: string) => {
    const from = localStorage.getItem("userEmail");
    const fromName = localStorage.getItem("userName");
    console.log("Enviando notificação para: ", email);

    // enviar para o fetch
    fetch("/api/poke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: from, to: email, fromName: fromName }),
    });
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-[#fff8f1]">
      <Dialog open={!isUserSet}>
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="w-[90%] md:w-[20%]">
          <DialogTitle>Suas informações</DialogTitle>
          <DialogDescription>
            Por favor, digite o seu nome e e-mail para completar a conexão.
          </DialogDescription>
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (email && name) {
                localStorage.setItem("userEmail", email);
                localStorage.setItem("userName", name); // Salva o nome junto ao e-mail
                setIsUserSet(true);
                sendUserInfoToServer(email, name, "connect");
              }
              //setShowDialog(false);
            }}
          >
            <input
              type="text"
              placeholder="Seu nome"
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
              className="p-2 border-2 border-[#382a00] rounded-lg w-full"
              required
            />
            <input
              type="email"
              placeholder="Seu email"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 border-2 border-[#382a00] rounded-lg w-full"
              required
            />
            <DialogFooter>
              <button
                type="submit"
                className="px-4 py-2 bg-[#325036] text-white rounded-lg mt-2"
              >
                Conectar
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="text-xl my-2 uppercase font-bold">
        Usuários Conectados
      </div>

      <div className="flex flex-col gap-4 w-full max-w-lg px-4">
        {connectedUsers
          .sort((a, b) => (a.email === email ? -1 : b.email === email ? 1 : 0)) // Ordena o usuário atual para o topo
          .map((user, index) => (
            <div
              key={index}
              className="flex items-center gap-2 py-2 border-1 border-[#382a00] bg-[#fef9e7] w-full rounded-lg px-2"
            >
              <div className="p-3 border-2 bg-[#382a00] rounded-full text-[#ffffff]">
                <IconUser size={16} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-lg text-[#382a00]">{user.name}</span>
                <span className="text-xs text-[#382a00]">{user.email}</span>
              </div>
              {user.email !== email ? (
                <button
                  type="button"
                  onClick={() => sendNotification(user.email)}
                  className="px-3 text-sm py-2 hover:cursor-pointer hover:scale-105 transition-all bg-[#325036] hover:bg-[#15321a] text-[#ffffff] rounded-lg flex items-center justify-center"
                >
                  Chamar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    sendUserInfoToServer(email!, name!, "disconnect");
                    localStorage.removeItem("userEmail");
                    localStorage.removeItem("userName");
                    setIsUserSet(false);
                  }}
                  className="px-3 text-sm py-2 hover:cursor-pointer hover:scale-105 transition-all bg-[#98000a] hover:bg-[#600004] text-[#ffffff] rounded-lg flex items-center justify-center"
                >
                  Sair
                </button>
              )}
            </div>
          ))}
      </div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </main>
  );
}
