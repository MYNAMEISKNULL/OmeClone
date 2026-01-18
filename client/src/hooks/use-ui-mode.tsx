import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type UIMode = "lite" | "full";

interface UIModeContextType {
  mode: UIMode;
  setMode: (mode: UIMode) => void;
  isLite: boolean;
}

const UIModeContext = createContext<UIModeContextType | undefined>(undefined);

export function UIModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<UIMode>(() => {
    const saved = localStorage.getItem("ui-mode");
    return (saved as UIMode) || "full";
  });

  useEffect(() => {
    localStorage.setItem("ui-mode", mode);
    if (mode === "lite") {
      document.documentElement.classList.add("ui-lite");
    } else {
      document.documentElement.classList.remove("ui-lite");
    }
  }, [mode]);

  return (
    <UIModeContext.Provider value={{ mode, setMode, isLite: mode === "lite" }}>
      {children}
    </UIModeContext.Provider>
  );
}

export function useUIMode() {
  const context = useContext(UIModeContext);
  if (!context) {
    throw new Error("useUIMode must be used within a UIModeProvider");
  }
  return context;
}
