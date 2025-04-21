import { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

// Define the shape of the context
interface SidebarContextType {
  showCategories: boolean;
  toggleCategories: () => void;
  setShowCategories: Dispatch<SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [showCategories, setShowCategories] = useState(false);

  const toggleCategories = () => {
    setShowCategories((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ showCategories, toggleCategories, setShowCategories }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
