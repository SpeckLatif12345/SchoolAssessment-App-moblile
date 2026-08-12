export function getSubjectStatus(student: any, subject: string) {
  const data = student.subjects?.[subject] || {};

  const projectWork = Number(data.ProjectWork ?? data.projectWork ?? 0);
  const classWork = Number(data.ClassWork ?? data.classWork ?? 0);
  const classTest1 = Number(data.ClassTest1 ?? data.classTestOne ?? 0);
  const classTest2 = Number(data.ClassTest2 ?? data.classTestTwo ?? 0);
  const homeWork = Number(data.HomeWork ?? 0);
  const examScore = Number(data.examScore ?? 0);

  const caFilled = [
    projectWork,
    classWork,
    classTest1,
    classTest2,
    homeWork,
  ].filter((v) => v > 0).length;

  if (caFilled === 0 && examScore === 0) return "empty"; // gray
  if (caFilled < 5 || examScore === 0) return "incomplete"; // red
  return "complete"; // green
}
