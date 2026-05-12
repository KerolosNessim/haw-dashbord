export const COURSES_QUERY_KEY = ["courses"] as const;

export const courseSectionsKey = (courseId: string | undefined) =>
  [...COURSES_QUERY_KEY, "sections", courseId] as const;
