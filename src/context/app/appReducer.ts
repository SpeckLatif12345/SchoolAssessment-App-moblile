export const initialState = {
  selectedClass: "",
  class_names: [
    "CLASS ONE",
    "CLASS TWO",
    "CLASS THREE",
    "CLASS FOUR",
    "CLASS FIVE",
    "CLASS SIX",
    "JSS ONE",
    "JSS TWO",
    "JSS THREE",
  ],
  totalAttendance: 0,
  isFullscreen: false,
  hasImported: false,
};

// appState type is initialState type
export type AppState = typeof initialState;

// action type
export type AppAction =
  | { type: "SET_CLASS"; payload: string }
  | { type: "CLEAR_CLASS" }
  | { type: "SET_TOTAL_ATTENDANCE"; payload: number }
  | { type: "CLEAR_TOTAL_ATTENDANCE" }
  | { type: "TOGGLE_FULLSCREEN" }
  | { type: "SET_IMPORT_STATUS"; payload: boolean };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CLASS":
      return {
        ...state,
        selectedClass: action.payload,
      };
    case "CLEAR_CLASS":
      return {
        ...state,
        selectedClass: "",
      };
    case "SET_TOTAL_ATTENDANCE":
      return {
        ...state,
        totalAttendance: action.payload,
      };
    case "CLEAR_TOTAL_ATTENDANCE":
      return {
        ...state,
        totalAttendance: 0,
      };
    case "TOGGLE_FULLSCREEN":
      return {
        ...state,
        isFullscreen: !state.isFullscreen,
      };
    case "SET_IMPORT_STATUS":
      return {
        ...state,
        hasImported: action.payload,
      };
    default:
      return state;
  }
}
