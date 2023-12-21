import {Router} from 'express';
import requireAuth from '../middlewares/requireAuth';
import authRouter from './auth/auth.router';
import userRouter from './user/user.router';
import recipeRouter from './recipe/recipe.router';
import {HelloWorldHandler} from './main.controller';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', requireAuth, userRouter);
router.use('/recipe', requireAuth, recipeRouter);
router.get('/', HelloWorldHandler);

export default router;
