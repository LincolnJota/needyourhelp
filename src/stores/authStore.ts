import { AvatarFullConfig } from "react-nice-avatar";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserInfo {
  email: string;
  name: string;
  avatar: AvatarFullConfig;
}

interface AuthState {
  user: UserInfo | null;
  socketId: string | null;
  isLoggedIn: boolean;
  avatar: AvatarFullConfig;
  login: (email: string, name: string, avatar: AvatarFullConfig) => void;
  logout: () => void;
  setAvatar: (config: AvatarFullConfig) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setSound: (
    theme: "poke.ogg" | "nudge.ogg" | "msn.ogg" | "lula-ajuda.ogg" | "tts"
  ) => void;
  theme: "light" | "dark" | "system";
  sound: "poke.ogg" | "nudge.ogg" | "msn.ogg" | "lula-ajuda.ogg" | "tts";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      theme: "light",
      sound: "tts",
      avatar: {
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
      },
      socketId: null,
      isLoggedIn: false,
      setTheme: (theme) => {
        set({
          theme,
        });
      },
      setSound: (sound) => {
        set({
          sound,
        });
      },
      setAvatar: (config: AvatarFullConfig) =>
        set({
          avatar: config,
        }),
      login: (email, name, avatar) =>
        set({
          user: { email, name, avatar },
          isLoggedIn: true,
          avatar: avatar,
        }),

      logout: () =>
        set({
          user: null,
          socketId: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
