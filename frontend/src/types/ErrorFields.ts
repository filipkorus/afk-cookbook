import {z} from 'zod';

type ErrorFields = Array<z.ZodIssue & { minimum?: number, maximum?: number }>;

export default ErrorFields;
