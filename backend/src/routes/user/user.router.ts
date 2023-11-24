import {Router} from 'express';
import requireAuth from '../../middlewares/requireAuth';
import {GetUserHandler} from './user.controller';

const router = Router();

router.get('/', requireAuth, GetUserHandler);

export default router;
