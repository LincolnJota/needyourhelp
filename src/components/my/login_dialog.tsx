"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import useAuthStore from "@/stores/authStore";
import Avatar, {
  AvatarFullConfig,
  EyeStyle,
  GlassesStyle,
  HairStyle,
  MouthStyle,
  ShirtStyle,
} from "react-nice-avatar";
import { IconEdit, IconRefresh } from "@tabler/icons-react";

export default function LoginDialog() {
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [avatarEditing, setAvatarEditing] = useState<boolean>(false);

  const authStore = useAuthStore();
  const [avatarConfig, setAvatarConfig] = useState<AvatarFullConfig>({
    sex: "man",
    faceColor: "#F9C9B6",
    earSize: "small",
    eyeStyle: "circle",
    noseStyle: "short",
    mouthStyle: "peace",
    shirtStyle: "polo",
    glassesStyle: "round",
    hairColor: "#000",
    hairStyle: "thick",
    hatStyle: "none",
    hatColor: "#000000",
    eyeBrowStyle: "up",
    shirtColor: "#FC909F",
    bgColor: "linear-gradient(45deg, #3e1ccd 0%, #ff6871 100%)",
  });

  useEffect(() => {
    if (authStore.avatar) {
      setAvatarConfig(authStore.avatar as AvatarFullConfig);
    }
  }, [authStore.avatar]);

  const updateConfig = (key: keyof AvatarFullConfig, value: string) => {
    setAvatarConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email && name) {
      authStore.login(email, name, authStore.avatar);
    }
  };

  const handleChangeFaceColor = () => {
    if (avatarConfig.faceColor == "#F9C9B6") {
      updateConfig("faceColor", "#AC6651");
    } else {
      updateConfig("faceColor", "#F9C9B6");
    }
  };

  const handleHairStyle = () => {
    const HAIR_STYLES: HairStyle[] = [
      "normal",
      "thick",
      "mohawk",
      "womanLong",
      "womanShort",
    ];

    const currentIndex = HAIR_STYLES.indexOf(
      avatarConfig.hairStyle as HairStyle
    );
    const nextIndex = (currentIndex + 1) % HAIR_STYLES.length; // Loop infinito na lista

    updateConfig("hairStyle", HAIR_STYLES[nextIndex]);
  };

  const handleEyeStyle = () => {
    const EYE_STYLES: EyeStyle[] = ["circle", "oval", "smile"];

    const currentIndex = EYE_STYLES.indexOf(avatarConfig.eyeStyle as EyeStyle);
    const nextIndex = (currentIndex + 1) % EYE_STYLES.length; // Loop infinito na lista

    updateConfig("eyeStyle", EYE_STYLES[nextIndex]);
  };

  const handleMouthStyle = () => {
    const MOUTH_STYLES: MouthStyle[] = ["smile", "laugh", "peace"];

    const currentIndex = MOUTH_STYLES.indexOf(
      avatarConfig.mouthStyle as MouthStyle
    );
    const nextIndex = (currentIndex + 1) % MOUTH_STYLES.length; // Loop infinito na lista

    updateConfig("mouthStyle", MOUTH_STYLES[nextIndex]);
  };

  const handleShirtStyle = () => {
    const SHIRT_STYLES: ShirtStyle[] = ["short", "hoody", "polo"];

    const currentIndex = SHIRT_STYLES.indexOf(
      avatarConfig.shirtStyle as ShirtStyle
    );
    const nextIndex = (currentIndex + 1) % SHIRT_STYLES.length; // Loop infinito na lista

    updateConfig("shirtStyle", SHIRT_STYLES[nextIndex]);
  };

  const handleGlassesStyle = () => {
    const GLASSES_STYLES: GlassesStyle[] = ["round", "square", "none"];

    const currentIndex = GLASSES_STYLES.indexOf(
      avatarConfig.glassesStyle as GlassesStyle
    );
    const nextIndex = (currentIndex + 1) % GLASSES_STYLES.length; // Loop infinito na lista

    updateConfig("glassesStyle", GLASSES_STYLES[nextIndex]);
  };

  const handleSaveAvatar = () => {
    authStore.setAvatar(avatarConfig);
    setAvatarEditing(false);
  };

  return (
    <Dialog open={!authStore.isLoggedIn}>
      <DialogTrigger className="hidden"></DialogTrigger>
      <DialogContent className="w-[90%] md:w-[20%] [&>button:last-child]:hidden">
        <DialogTitle>Suas informações</DialogTitle>
        <DialogDescription>
          Por favor, digite o seu nome e e-mail para completar a conexão.
        </DialogDescription>
        <form className="flex flex-col gap-2" onSubmit={handleLogin}>
          <div className="flex w-full items-center justify-center relative">
            {/* Avatar com o Overlay */}
            <div className="flex items-center justify-center w-30 h-30 bg-slate-50 border-1 border-slate-400 rounded-full relative">
              {/* Avatar */}
              <Avatar className="w-full h-full" {...authStore.avatar} />

              {/* Overlay escuro */}
              <div className="absolute inset-0 bg-black opacity-30 rounded-full"></div>

              {/* Botão de Editar */}
              <button
                type="button"
                className="absolute text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 bg-[#325036] opacity-50 rounded-full focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                onClick={() => {
                  setAvatarEditing(true);
                }}
              >
                <IconEdit />
              </button>
            </div>
          </div>

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
      <Dialog open={avatarEditing}>
        <DialogContent
          onCloseClick={() => {
            setAvatarEditing(false);
          }}
          className="w-[90%] md:w-[20%]"
        >
          <DialogTitle>Escolher Avatar</DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex flex-col gap-2 items-center justify-center">
            <Avatar className="w-32 h-32" {...avatarConfig} />
            <div className="flex flex-col gap-2 p-2">
              <button
                onClick={() => handleChangeFaceColor()}
                className="flex group flex-row items-center justify-center gap-2 px-3 py-2 border-1 border-slate-600 text-black rounded-lg hover:translate-y-[-2px] hover:bg-black hover:text-white transition-all hover:cursor-pointer"
              >
                <IconRefresh className="group-hover:animate-spin" size={16} />
                Tom de Pele
              </button>
              <button
                onClick={() => handleHairStyle()}
                className="flex group flex-row items-center justify-center gap-2 px-3 py-2 border-1 border-slate-600 text-black rounded-lg hover:translate-y-[-2px] hover:bg-black hover:text-white transition-all hover:cursor-pointer"
              >
                <IconRefresh className="group-hover:animate-spin" size={16} />
                Cabelo
              </button>
              <button
                onClick={() => handleEyeStyle()}
                className="flex group flex-row items-center justify-center gap-2 px-3 py-2 border-1 border-slate-600 text-black rounded-lg hover:translate-y-[-2px] hover:bg-black hover:text-white transition-all hover:cursor-pointer"
              >
                <IconRefresh className="group-hover:animate-spin" size={16} />
                Olho
              </button>
              <button
                onClick={() => handleGlassesStyle()}
                className="flex group flex-row items-center justify-center gap-2 px-3 py-2 border-1 border-slate-600 text-black rounded-lg hover:translate-y-[-2px] hover:bg-black hover:text-white transition-all hover:cursor-pointer"
              >
                <IconRefresh className="group-hover:animate-spin" size={16} />
                Óculos
              </button>
              <button
                onClick={() => handleMouthStyle()}
                className="flex group flex-row items-center justify-center gap-2 px-3 py-2 border-1 border-slate-600 text-black rounded-lg hover:translate-y-[-2px] hover:bg-black hover:text-white transition-all hover:cursor-pointer"
              >
                <IconRefresh className="group-hover:animate-spin" size={16} />
                Boca
              </button>
              <button
                onClick={() => handleShirtStyle()}
                className="flex group flex-row items-center justify-center gap-2 px-3 py-2 border-1 border-slate-600 text-black rounded-lg hover:translate-y-[-2px] hover:bg-black hover:text-white transition-all hover:cursor-pointer"
              >
                <IconRefresh className="group-hover:animate-spin" size={16} />
                Roupa
              </button>
              <div
                onClick={() => {
                  const colorInput = document.getElementById(
                    "color-picker"
                  ) as HTMLInputElement;
                  colorInput?.click();
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 border-1 border-slate-600 text-black rounded-lg hover:translate-y-[-2px] hover:bg-black hover:text-white transition-all hover:cursor-pointer"
              >
                Cor da Roupa
                <input
                  type="color"
                  id="color-picker"
                  value={avatarConfig.shirtColor}
                  onChange={(e) => {
                    updateConfig("shirtColor", e.target.value);
                  }}
                  className="w-8 h-8 border rounded-md cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleSaveAvatar()}
              className="bg-[#325036] text-sm hover:cursor-pointer hover:translate-y-[-2px] transition-all text-white rounded-lg px-3 py-2"
            >
              Salvar Alterações
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
