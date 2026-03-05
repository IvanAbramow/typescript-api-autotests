import { z } from 'zod';

const User = z
  .object({
    id: z.string(),
    email: z.string().min(1).max(250).email(),
    lastName: z.string().min(1).max(50),
    firstName: z.string().min(1).max(50),
    middleName: z.string().min(1).max(50),
  })
  .passthrough();
export type UserParams = z.infer<typeof User>;

const GetUserResponse = z.object({ user: User }).passthrough();
export type GetUserResponseParams = z.infer<typeof GetUserResponse>;

const ValidationError = z
  .object({
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
    type: z.string(),
  })
  .passthrough();
export type ValidationErrorParams = z.infer<typeof ValidationError>;

const HTTPValidationError = z
  .object({ detail: z.array(ValidationError) })
  .partial()
  .passthrough();
export type HTTPValidationErrorParams = z.infer<typeof HTTPValidationError>;

const HTTPUnauthorizedError = z.object({ detail: z.string() });
export type HTTPUnauthorizedError = z.infer<typeof HTTPUnauthorizedError>;

const UpdateUserRequest = z
  .object({
    email: z.union([z.string(), z.null()]),
    lastName: z.union([z.string(), z.null()]),
    firstName: z.union([z.string(), z.null()]),
    middleName: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
export type UpdateUserRequestParams = z.infer<typeof UpdateUserRequest>;

const CreateUserRequest = z
  .object({
    email: z.string().min(1).max(250).email(),
    password: z.string().min(1).max(250),
    lastName: z.string().min(1).max(50),
    firstName: z.string().min(1).max(50),
    middleName: z.string().min(1).max(50),
  })
  .passthrough();
export type CreateUserRequestParams = z.infer<typeof CreateUserRequest>;

const LoginRequest = z.object({ email: z.string().email(), password: z.string() }).passthrough();
export type LoginRequestParams = z.infer<typeof LoginRequest>;

const Token = z
  .object({
    tokenType: z.string().optional().default('bearer'),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .passthrough();
export type TokenParams = z.infer<typeof Token>;

const LoginResponse = z.object({ token: Token }).passthrough();
export type LoginResponseParams = z.infer<typeof LoginResponse>;

const RefreshRequest = z.object({ refreshToken: z.string() }).passthrough();
export type RefreshRequestParams = z.infer<typeof RefreshRequest>;

const File = z
  .object({
    id: z.string(),
    filename: z.string().max(250),
    directory: z.string().max(250),
    url: z.string().min(1).max(2083).url(),
  })
  .passthrough();
export type FileParams = z.infer<typeof File>;

const GetFileResponse = z.object({ file: File }).passthrough();
export type GetFileResponseParams = z.infer<typeof GetFileResponse>;

const Course = z
  .object({
    id: z.string(),
    title: z.string().min(1).max(250),
    maxScore: z.union([z.number(), z.null()]).optional(),
    minScore: z.union([z.number(), z.null()]).optional(),
    description: z.string().min(1),
    previewFile: File,
    estimatedTime: z.union([z.string(), z.null()]).optional(),
    createdByUser: User,
  })
  .passthrough();
export type CourseParams = z.infer<typeof Course>;

const GetCoursesResponse = z.object({ courses: z.array(Course) }).passthrough();
export type GetCoursesResponseParams = z.infer<typeof GetCoursesResponse>;

const CreateCourseRequest = z
  .object({
    title: z.string().min(1).max(250),
    maxScore: z.union([z.number(), z.null()]).optional(),
    minScore: z.union([z.number(), z.null()]).optional(),
    description: z.string().min(1),
    estimatedTime: z.union([z.string(), z.null()]).optional(),
    previewFileId: z.string(),
    createdByUserId: z.string(),
  })
  .passthrough();
export type CreateCourseRequestParams = z.infer<typeof CreateCourseRequest>;

const GetCourseResponse = z.object({ course: Course }).passthrough();
export type GetCourseResponseParams = z.infer<typeof GetCourseResponse>;

const UpdateCourseRequest = z
  .object({
    title: z.union([z.string(), z.null()]),
    maxScore: z.union([z.number(), z.null()]),
    minScore: z.union([z.number(), z.null()]),
    description: z.union([z.string(), z.null()]),
    estimatedTime: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
export type UpdateCourseRequestParams = z.infer<typeof UpdateCourseRequest>;

const Exercise = z
  .object({
    id: z.string(),
    title: z.string().min(1).max(250),
    courseId: z.string(),
    maxScore: z.union([z.number(), z.null()]),
    minScore: z.union([z.number(), z.null()]),
    orderIndex: z.number().int().optional().default(0),
    description: z.string().min(1),
    estimatedTime: z.union([z.string(), z.null()]),
  })
  .passthrough();
export type ExerciseParams = z.infer<typeof Exercise>;

const GetExercisesResponse = z.object({ exercises: z.array(Exercise) }).passthrough();
export type GetExercisesResponseParams = z.infer<typeof GetExercisesResponse>;

const CreateExerciseRequest = z
  .object({
    title: z.string().min(1).max(250),
    courseId: z.string(),
    maxScore: z.union([z.number(), z.null()]),
    minScore: z.union([z.number(), z.null()]),
    orderIndex: z.number().int().optional().default(0),
    description: z.string().min(1),
    estimatedTime: z.union([z.string(), z.null()]),
  })
  .passthrough();
export type CreateExerciseRequestParams = z.infer<typeof CreateExerciseRequest>;

const GetExerciseResponse = z.object({ exercise: Exercise }).passthrough();
export type GetExerciseResponseParams = z.infer<typeof GetExerciseResponse>;

const UpdateExerciseRequest = z
  .object({
    title: z.union([z.string(), z.null()]),
    maxScore: z.union([z.number(), z.null()]),
    minScore: z.union([z.number(), z.null()]),
    orderIndex: z.union([z.number(), z.null()]),
    description: z.union([z.string(), z.null()]),
    estimatedTime: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
export type UpdateExerciseRequestParams = z.infer<typeof UpdateExerciseRequest>;

export const ZOD_SCHEMAS = {
  User,
  GetUserResponse,
  ValidationError,
  HTTPValidationError,
  HTTPUnauthorizedError,
  UpdateUserRequest,
  CreateUserRequest,
  LoginRequest,
  Token,
  LoginResponse,
  RefreshRequest,
  File,
  GetFileResponse,
  Course,
  GetCoursesResponse,
  CreateCourseRequest,
  GetCourseResponse,
  UpdateCourseRequest,
  Exercise,
  GetExercisesResponse,
  CreateExerciseRequest,
  GetExerciseResponse,
  UpdateExerciseRequest,
};
