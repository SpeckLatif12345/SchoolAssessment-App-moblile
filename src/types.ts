export type RootStackParamList = {
  Welcome: undefined;
  StudentList: undefined;
  StudentDetail: { studentId: string };
  StudentMarks: { studentId: string };
  Settings: undefined;
};

// creating types
export type Student = {
  id: string;
  name: string;
  subjects: Record<string, any> | Record<string, number>;
  attendance: number;
  promoted_to: string;
  behaviour: {
    conduct: string;
    attitude: string;
    interest: string;
    class_teacher_remarks: string;
  };
};
