import {Router} from 'express';
import {LoginHandler, LogoutHandler, RefreshTokenHandler} from './auth.controller';
import requireAuth from '../../middlewares/requireAuth';

const router = Router();

router.post('/login', LoginHandler);
router.post('/refresh', RefreshTokenHandler);

router.get('/logout', requireAuth, LogoutHandler);

export default router;
