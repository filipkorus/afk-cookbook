import {Request, Response} from 'express';
import {SUCCESS} from '../utils/httpCodeResponses/messages';

export const HelloWorldHandler = async (req: Request, res: Response) => {
	return SUCCESS(res, 'Hello world!');
};
