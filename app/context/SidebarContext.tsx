"use client";

import { createContext, useContext, useState } from "react";

interface SidebarContextType {
  showCategories: boolean;
  toggleCategories: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [showCategories, setShowCategories] = useState(false);

  const toggleCategories = () => {
    setShowCategories((prev) => !prev);
  };

  return <SidebarContext.Provider value={{ showCategories, toggleCategories }}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar debe usarse dentro de un SidebarProvider");
  }
  return context;
}
