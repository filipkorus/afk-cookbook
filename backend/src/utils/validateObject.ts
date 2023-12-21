import {z, ZodIssue} from 'zod';
import logger from './logger';

function validateObject<T>(schema: z.ZodType<T, any, any>, input: unknown): { data: T, errors: null } | {
	data: null,
	errors: Array<ZodIssue>
} {
	const validationResult = schema.safeParse(input);
	if (validationResult.success) {
		return {
			data: validationResult.data,
			errors: null
		};
	}

	logger.debug(`Validation Errors: ${JSON.stringify(validationResult.error.errors)}`);

	return {
		data: null,
		errors: validationResult.error.errors
	};
}

export default validateObject;
