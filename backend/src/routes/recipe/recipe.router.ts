import {Router} from 'express';
import {
	CreateRecipeHandler, DeleteRecipeHandler,
	GetRecipeByIdHandler,
	GetRecipesByIngredientOrCategoryNameNameHandler,
	GetRecipesHandler, UpdateRecipeHandler
} from './recipe.controller';
import reviewRouter from './review/review.router';

const router = Router();

router.use('/review', reviewRouter);

router.get('/ingredient/:name', GetRecipesByIngredientOrCategoryNameNameHandler('ingredient'));
router.get('/category/:name', GetRecipesByIngredientOrCategoryNameNameHandler('category'));

router.get('/:id', GetRecipeByIdHandler);
router.put('/:id', UpdateRecipeHandler);
router.delete('/:id', DeleteRecipeHandler);
router.post('/', CreateRecipeHandler);

router.get('/', GetRecipesHandler);

export default router;
