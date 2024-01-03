import {Router} from 'express';
import {GetUserHandler} from './user.controller';

const router = Router();

router.get('/', GetUserHandler);

export default router;
