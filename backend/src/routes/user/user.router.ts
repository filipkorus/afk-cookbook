import {Router} from 'express';
import {GetUserByIdHandler, GetUserHandler} from './user.controller';

const router = Router();

router.get('/:id', GetUserByIdHandler);
router.get('/', GetUserHandler);

export default router;
