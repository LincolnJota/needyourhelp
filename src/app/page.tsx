"use client";

import { useEffect, useState } from "react";
import Pusher, { Channel } from "pusher-js";
import LoginDialog from "@/components/my/login_dialog";
import useAuthStore from "@/stores/authStore";
import { toast, ToastContainer } from "react-toastify";
import SendNotificationButton from "@/components/my/send_notification_button";
import Avatar, { AvatarFullConfig } from "react-nice-avatar";
import dynamic from "next/dynamic";
import { IconSettings } from "@tabler/icons-react";
import SettingsDialog from "@/components/my/settings_dialog";
import { AnimatePresence, motion } from "motion/react";

const GridLoader = dynamic(() => import("react-spinners/GridLoader"), {
  ssr: false,
});

export default function TestePage() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openSettings, setOpenSettings] = useState<boolean>(false);
  const authStore = useAuthStore();
  const [connectedUsers, setConnectedUsers] = useState<
    Map<string, { email: string; name: string; avatar: AvatarFullConfig }>
  >(new Map());

  useEffect(() => {
    if (!authStore.isLoggedIn) {
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration);
        })
        .catch((error) => {
          console.log("Falha ao registrar o Service Worker:", error);
        });
    }

    const { email, name } = authStore.user!;
    const { avatar } = authStore;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      channelAuthorization: {
        endpoint: "/api/channel",
        transport: "ajax",
        params: {
          email,
          name,
          avatar: JSON.stringify(avatar),
        },
      },
      userAuthentication: {
        endpoint: "/api/pusher",
        transport: "ajax",
        params: {
          email,
          name,
          avatar: JSON.stringify(avatar),
        },
      },
    });

    pusher.signin();

    const channel = pusher.subscribe("presence-cutucar");
    setChannel(channel);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    channel.bind("pusher:subscription_succeeded", (members: any) => {
      const usersMap = new Map();
      members.each((member: any) => {
        const { email, name, avatar } = member.info;
        const avatarParsed = JSON.parse(avatar);

        usersMap.set(email, {
          email,
          name,
          avatar: avatarParsed as AvatarFullConfig,
        });
      });

      setConnectedUsers(usersMap);

      const { email, name } = authStore.user!;

      if (usersMap.has(email)) {
        const existingUser = usersMap.get(email);

        if (existingUser.name !== name) {
          authStore.logout();
          toast.error("Usuário já logado!");
        }
      }
      setLoading(false);
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    channel.bind("pusher:member_added", (member: any) => {
      setConnectedUsers(
        (
          prevUsersMap: Map<
            string,
            { email: string; name: string; avatar: AvatarFullConfig }
          >
        ) => {
          const updatedMap = new Map(prevUsersMap);
          const { email, name, avatar } = member.info;
          const avatarParsed = JSON.parse(avatar);

          updatedMap.set(email, { email, name, avatar: avatarParsed });
          return updatedMap;
        }
      );
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    channel.bind("pusher:member_removed", (member: any) => {
      console.log("Usuário desconectado:", member);

      setConnectedUsers(
        (
          prevUsersMap: Map<
            string,
            { email: string; name: string; avatar: AvatarFullConfig }
          >
        ) => {
          prevUsersMap.delete(member.info.email);
          return new Map(prevUsersMap);
        }
      );
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    channel.bind("client-cutucar", (data: any) => {
      if (data.to !== email) return;

      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready
          .then((registration) => {
            registration.showNotification(
              data.fromName + " está te chamando!",
              {
                body: "teste",
                icon: "/assovio.png",
              }
            );
          })
          .catch(() => {
            console.log("erro ao enviar msg");
          });
      } else {
        Notification.requestPermission().then(function (getperm) {
          console.log("Perm granted", getperm);
        });
        toast.dismiss();
        toast.warn(data.fromName + " está te chamando!");
      }

      if (authStore.sound == "tts") {
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(
            data.fromName + " está te chamando!"
          );
          utterance.lang = "pt-BR"; // Definir o idioma para português
          utterance.rate = 1.5; // Velocidade normal
          utterance.pitch = 1; // Tom normal
          speechSynthesis.speak(utterance);
        }
      }

      const hsound = new Howl({
        src: [`/${authStore.sound}`], // Usa o valor atualizado
        preload: true,
        volume: 1.0,
      });

      hsound.play();
    });

    return () => {
      pusher.disconnect();
    };
  }, [authStore]); // cuidado aqui, ficava u user e o sound.

  const sendNotification = async (to: string) => {
    const { email, name } = authStore.user!;

    channel?.trigger("client-cutucar", {
      from: email,
      fromName: name,
      to,
    });
  };

  if (loading) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center bg-[#fff8f1]">
        <GridLoader color="#382a00" />
        <LoginDialog />
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-start bg-[#fff8f1] relative pt-10">
      <div className="absolute top-4 right-4">
        <IconSettings
          onClick={() => {
            setOpenSettings(true);
          }}
          size={30}
          className="text-[#382a00] hover:animate-spin cursor-pointer hover:scale-110 transition-transform"
        />
      </div>
      <div className="text-xl my-2 uppercase font-bold text-[#382a00] mb-4">
        Usuários Conectados
      </div>
      <ul className="flex flex-col gap-4 w-full max-w-lg px-4">
        <AnimatePresence>
          {Array.from(connectedUsers.values())
            .sort((a, b) => {
              // Coloca o usuário logado no topo
              if (a.email === authStore.user?.email) return -1;
              if (b.email === authStore.user?.email) return 1;
              return 0;
            })
            .map((user, index) => (
              <motion.li
                key={index}
                layout
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="flex items-center gap-2 py-2 border-1 border-[#382a00] bg-[#fef9e7] w-full rounded-lg px-2 justify-between"
              >
                <div className="h-12 w-12 border-2 bg-[#382a00] rounded-full text-[#ffffff] flex">
                  <Avatar className="w-full h-full" {...user.avatar} />
                </div>
                <div className="flex flex-col max-w-[55%]">
                  <div className="text-lg text-[#382a00] min-w-min">
                    {user.name}
                  </div>
                  <div className="text-xs text-[#382a00] opacity-70 overflow-hidden text-ellipsis">
                    {user.email}
                  </div>
                </div>
                <div className="flex flex-1/10 justify-end">
                  {user.email !== authStore.user?.email ? (
                    <SendNotificationButton
                      onClick={() => sendNotification(user.email)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        authStore.logout();
                        setConnectedUsers(new Map());
                      }}
                      className="px-3 text-sm py-2 hover:cursor-pointer hover:scale-105 transition-all bg-[#98000a] hover:bg-[#600004] text-[#ffffff] rounded-lg flex items-center justify-center"
                    >
                      Sair
                    </button>
                  )}
                </div>
              </motion.li>
            ))}
        </AnimatePresence>
      </ul>
      <SettingsDialog
        open={openSettings}
        onCloseClick={() => setOpenSettings(false)}
      />
      <LoginDialog />
      <ToastContainer
        position="top-right"
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
