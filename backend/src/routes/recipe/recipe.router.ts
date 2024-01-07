import {Router} from 'express';
import {
	CreateRecipeHandler,
	GetRecipeByIdHandler,
	GetRecipesByIngredientOrCategoryNameNameHandler,
	GetRecipesHandler
} from './recipe.controller';
import reviewRouter from './review/review.router';

const router = Router();

router.use('/review', reviewRouter);

router.get('/ingredient/:name', GetRecipesByIngredientOrCategoryNameNameHandler('ingredient'));
router.get('/category/:name', GetRecipesByIngredientOrCategoryNameNameHandler('category'));
router.get('/:id', GetRecipeByIdHandler);
router.get('/', GetRecipesHandler);
router.post('/', CreateRecipeHandler);

export default router;
