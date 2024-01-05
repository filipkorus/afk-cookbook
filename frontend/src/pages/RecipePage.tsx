import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getRecipeById} from '@/api/recipe.ts';
import {AxiosError} from 'axios';
import RecipeCard, {RecipeWithCategoriesIngredientsAuthorAndStars} from '@/components/recipe/RecipeCard';

const RecipePage: React.FC = () => {
	const {id: recipeId} = useParams();
	const navigate = useNavigate();
	const [recipe, setRecipe] = useState<RecipeWithCategoriesIngredientsAuthorAndStars | null>(null);


	useEffect(() => {
		if (recipeId == null) return;

		getRecipeById(+recipeId)
			.then(({recipe}) => setRecipe(recipe))
			.catch((error) => {
				console.error(error);

				if (!(error instanceof AxiosError)) return;

				if (error?.response?.status === 404) {
					navigate('/');
				}
			});
	}, [recipeId]);

	if (recipe == null) {
		return <></>;
	}

	return <RecipeCard recipe={recipe} />;
};

export default RecipePage;
