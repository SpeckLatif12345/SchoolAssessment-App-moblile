import React, { createContext, useContext, useReducer, ReactNode } from "react";
import studentReducer, {
  initialState,
  StudentState,
  StudentAction,
} from "./studentReducer";

type StudentContextType = {
  state: StudentState;
  dispatch: React.Dispatch<StudentAction>;
};

const StudentContext = createContext<StudentContextType | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(studentReducer, initialState);

  return (
    <StudentContext.Provider value={{ state, dispatch }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudents must be used inside StudentProvider");
  }
  return context;
}
