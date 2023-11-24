import {Request, Response, Router} from 'express';
import authRouter from './auth/auth.router';
import userRouter from './user/user.router';
import requireAuth from '../middlewares/requireAuth';
import {SUCCESS} from '../utils/httpCodeResponses/messages';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', requireAuth, userRouter);

router.get('/', (req: Request, res: Response) => SUCCESS(res, 'Hello world!'));

export default router;
