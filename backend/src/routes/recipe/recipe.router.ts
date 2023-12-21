import {Router} from 'express';
import {CreateRecipeHandler, GetRecipeByIdHandler, GetRecipesHandler} from './recipe.controller';

const router = Router();

router.get('/:id', GetRecipeByIdHandler);
router.get('/', GetRecipesHandler);
router.post('/', CreateRecipeHandler);

export default router;
