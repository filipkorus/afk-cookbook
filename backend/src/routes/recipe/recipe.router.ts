import {Router} from 'express';
import {
	CreateRecipeHandler,
	GetRecipeByIdHandler,
	GetRecipesByUserIdHandler,
	GetRecipesHandler
} from './recipe.controller';

const router = Router();

router.get('/:id', GetRecipeByIdHandler);
router.get('/user/:id', GetRecipesByUserIdHandler);
router.get('/', GetRecipesHandler);
router.post('/', CreateRecipeHandler);

export default router;
