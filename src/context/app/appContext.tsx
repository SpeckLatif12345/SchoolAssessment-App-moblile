import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { initialState, AppAction, AppState, appReducer } from "./appReducer";

// creating types
type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  chooseClass: (className: string) => void;
  totalAttendance: (attendance: number) => void;
  resetSetup: () => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  function chooseClass(className: string) {
    dispatch({ type: "SET_CLASS", payload: className });
  }

  function totalAttendance(attendance: number) {
    dispatch({ type: "SET_TOTAL_ATTENDANCE", payload: attendance });
  }

  function resetSetup() {
    dispatch({ type: "CLEAR_CLASS" });
    dispatch({ type: "CLEAR_TOTAL_ATTENDANCE" });
  }

  return (
    <AppContext.Provider
      value={{ state, dispatch, chooseClass, totalAttendance, resetSetup }}
    >
      {children}
    </AppContext.Provider>
  );
}

// exporting the useApp hook for consuming the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
