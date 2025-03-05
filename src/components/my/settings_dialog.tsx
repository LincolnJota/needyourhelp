"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import useAuthStore from "@/stores/authStore";
import { Howl } from "howler";
import { useState } from "react";

export default function SettingsDialog({
  open,
  onCloseClick,
}: {
  open: boolean;
  onCloseClick: () => void;
}) {
  const authStore = useAuthStore();
  const [currentSound, setCurrentSound] = useState<Howl | null>(null);

  const handleChangeTheme = (theme: "light" | "dark" | "system") => {
    authStore.setTheme(theme);
  };

  const handleSoundTheme = (
    sound: "poke.ogg" | "nudge.ogg" | "msn.ogg" | "lula-ajuda.ogg" | "tts"
  ) => {
    authStore.setSound(sound);

    if (currentSound) {
      currentSound.stop();
    }

    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }

    if (sound == "tts") {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          authStore.user?.name + " está te chamando!"
        );
        utterance.lang = "pt-BR"; // Definir o idioma para português
        utterance.rate = 1.5; // Velocidade normal
        utterance.pitch = 1; // Tom normal
        speechSynthesis.speak(utterance);
      }
      return;
    }

    const hsound = new Howl({
      src: [`/${sound}`],
      preload: true,
      onend: () => setCurrentSound(null),
      volume: 1.0,
    });

    hsound.play();
    setCurrentSound(hsound);
  };

  return (
    <Dialog open={open}>
      <DialogTrigger className="hidden"></DialogTrigger>
      <DialogContent
        className="w-[90%] md:w-[20%]"
        onCloseClick={() => {
          currentSound?.stop();
          onCloseClick();
        }}
      >
        <DialogTitle className="text-primary">Configurações</DialogTitle>
        <div className="flex flex-col gap-2 mt-2">
          <Label htmlFor="email">Tema Atual</Label>
          <Select
            disabled
            value={authStore.theme}
            onValueChange={handleChangeTheme}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar Tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Label htmlFor="sound">Som de Notificação</Label>
        <div className="flex flex-row items-center justify-left">
          <Select value={authStore.sound} onValueChange={handleSoundTheme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar Som" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tts">Falar Mensagem</SelectItem>
              <SelectItem value="poke.ogg">Poke</SelectItem>
              <SelectItem value="nudge.ogg">Nudge</SelectItem>
              <SelectItem value="msn.ogg">Msn</SelectItem>
              <SelectItem value="lula-ajuda.ogg">
                Lula (Pfvr me ajuda)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}
