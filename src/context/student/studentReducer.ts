import { Student } from "@/src/types";
export const initialState = {
  students: [] as Student[],
  currentSubject: "Mathematics",
  subjects: [
    "Mathematics",
    "Integrated Science",
    "Social Studies",
    "Creative Arts",
    "Twi",
    "French",
    "Religious & Moral Education",
    "Computing",
    "English Language",
    "Career Technology",
    "History",
  ],
  name: "",
  saved: false,
};

// redefining the type of initialState to StudentState
export type StudentState = typeof initialState;

export type StudentAction =
  | { type: "FETCH_STUDENTS"; payload: Student[] }
  | { type: "ADD_STUDENT"; payload: Student }
  | { type: "REMOVE_STUDENT"; payload: string }
  | { type: "CLEAR_STUDENTS" }
  | { type: "SET_SUBJECT"; payload: string }
  | {
      type: "SET_SCORE";
      payload: { id: string; field: string; value: number | string };
    }
  | { type: "GRADES_SAVED" }
  | { type: "SET_STUDENT_ATTENDANCE"; payload: { id: string; value: number } }
  | { type: "SET_PROMOTED_TO"; payload: { id: string; value: string } }
  | {
      type: "SET_BEHAVIOUR";
      payload: { id: string; field: string; value: string };
    };

function studentReducer(
  state: StudentState,
  action: StudentAction,
): StudentState {
  switch (action.type) {
    case "FETCH_STUDENTS":
      return {
        ...state,
        students: action.payload,
      };

    case "ADD_STUDENT":
      return {
        ...state,
        students: [...state.students, action.payload],
      };

    case "REMOVE_STUDENT":
      return {
        ...state,
        students: state.students.filter((s) => s.id !== action.payload),
      };

    case "CLEAR_STUDENTS":
      return {
        ...state,
        students: [],
        saved: false,
      };

    case "SET_SUBJECT":
      return {
        ...state,
        currentSubject: action.payload,
      };

    case "SET_SCORE": {
      const { id, field, value } = action.payload;

      const titles = [
        "ProjectWork",
        "ClassWork",
        "ClassTest1",
        "ClassTest2",
        "HomeWork",
      ];

      const scores: { [key: string]: number } = {
        ProjectWork: 20,
        ClassWork: 40,
        ClassTest1: 10,
        ClassTest2: 10,
        HomeWork: 20,
        examScore: 100,
      };

      return {
        ...state,
        students: state.students.map((student) => {
          if (student.id === id) {
            // getting current subject from the student object, if it doesn't exist, create an empty object
            const currentSubject =
              student.subjects?.[state.currentSubject] || {};

            // getting field score
            const field_score = scores[field as keyof typeof scores] || 0;

            // Update the edited field
            const updatedSubject = {
              ...currentSubject,
              [field]: Number(value) <= field_score ? Number(value) : 0,
            };

            const totalA = titles.reduce((sum, key) => {
              return sum + Number(updatedSubject[key] || 0);
            }, 0);

            const classPercent = Math.round((totalA / 100) * 50);
            const examPercent = Math.round(
              (Number(updatedSubject.examScore || 0) / 100) * 50,
            );

            return {
              ...student,
              subjects: {
                ...student.subjects,
                [state.currentSubject]: {
                  ...student.subjects?.[state.currentSubject],
                  ...updatedSubject,
                  classPercent,
                  examPercent,
                  totalA,
                },
              },
            };
          }
          return student;
        }),
      };
    }

    case "GRADES_SAVED":
      return {
        ...state,
        saved: true,
      };

    case "SET_STUDENT_ATTENDANCE": {
      const { id, value } = action.payload;
      console.log("SET_STUDENT_ATTENDANCE action.payload: ", action.payload);
      return {
        ...state,
        students: state.students.map((student) =>
          student.id === id
            ? { ...student, attendance: Number(value) }
            : student,
        ),
      };
    }

    case "SET_PROMOTED_TO": {
      const { id, value } = action.payload;
      return {
        ...state,
        students: state.students.map((student) =>
          student.id === id ? { ...student, promoted_to: value } : student,
        ),
      };
    }

    case "SET_BEHAVIOUR":
      return {
        ...state,
        students: state.students.map((student) =>
          student.id === action.payload.id
            ? {
                ...student,
                behaviour: {
                  ...student.behaviour,
                  [action.payload.field]: action.payload.value,
                },
              }
            : student,
        ),
      };

    default:
      return state;
  }
}

export default studentReducer;
