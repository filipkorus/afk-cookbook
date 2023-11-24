import {Request, Response} from 'express';
import {SUCCESS} from '../../utils/httpCodeResponses/messages';

export const GetUserHandler = async (req: Request, res: Response) => {
	return SUCCESS(res, 'Success', {user: res.locals.user});
};
