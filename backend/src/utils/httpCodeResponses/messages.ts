import respond from './respond';
import {Response} from 'express';

export const RESPONSE = (res: Response, message: string, status: number, data: object = {}) => respond(res, message, status, data);

export const ACCOUNT_CREATED = (res: Response, data: object = {}) => respond(res, "Account has been created!", 201, data);

export const INVALID_LOGIN_CREDENTIALS = (res: Response, data: object = {}) => respond(res, "Invalid username or password", 401, data);

export const ACCOUNT_BANNED = (res: Response, data: object = {}) => respond(res, "Your account has been banned", 403, data);

export const SUCCESS = (res: Response, message: string | undefined = undefined, data: object = {}) => respond(res, message ?? "Success", 200, data);

export const BAD_REQUEST = (res: Response, message: string | undefined = undefined, data: object = {}) => respond(res, message ?? "Bad request", 400, data);

export const UNAUTHORIZED = (res: Response, message: string | undefined = undefined, data: object = {}) => respond(res, message ?? "Unauthorized", 401, data);

export const FORBIDDEN = (res: Response, message: string | undefined = undefined, data: object = {}) => respond(res, message ?? "Forbidden", 403, data);

export const NOT_FOUND = (res: Response, message: string | undefined = undefined, data: object = {}) => respond(res, message ?? "Not found", 404, data);

export const CONFLICT = (res: Response, message: string | undefined = undefined, data: object = {}) => respond(res, message ?? "Conflict", 409, data);

export const SERVER_ERROR = (res: Response, message: string | undefined = undefined, data: object = {}) => respond(res, message ?? "Server error", 500, data);
