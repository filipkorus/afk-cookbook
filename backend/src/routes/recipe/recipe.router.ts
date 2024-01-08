import {Router} from 'express';
import {
	CreateRecipeHandler, DeleteRecipeHandler,
	GetRecipeByIdHandler,
	GetRecipesByIngredientOrCategoryNameHandler, GetRecipesByIngredientOrCategoryNamesListHandler,
	GetRecipesHandler, UpdateRecipeHandler
} from './recipe.controller';
import reviewRouter from './review/review.router';

const router = Router();

router.use('/review', reviewRouter);

router.get('/ingredients/:commaSeparatedNames', GetRecipesByIngredientOrCategoryNamesListHandler('ingredient'));
router.get('/categories/:commaSeparatedNames', GetRecipesByIngredientOrCategoryNamesListHandler('category'));

router.get('/ingredient/:name', GetRecipesByIngredientOrCategoryNameHandler('ingredient'));
router.get('/category/:name', GetRecipesByIngredientOrCategoryNameHandler('category'));

router.get('/:id', GetRecipeByIdHandler);
router.put('/:id', UpdateRecipeHandler);
router.delete('/:id', DeleteRecipeHandler);
router.post('/', CreateRecipeHandler);

router.get('/', GetRecipesHandler);

export default router;
