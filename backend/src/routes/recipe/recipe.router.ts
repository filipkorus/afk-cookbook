import {Router} from 'express';
import {
	CreateRecipeHandler,
	GetRecipeByIdHandler,
	GetRecipesHandler
} from './recipe.controller';
import reviewRouter from './review/review.router';

const router = Router();

router.use('/review', reviewRouter);

router.get('/:id', GetRecipeByIdHandler);
router.get('/', GetRecipesHandler);
router.post('/', CreateRecipeHandler);

export default router;
