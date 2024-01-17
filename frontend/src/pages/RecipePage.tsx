import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {getRecipeById} from '@/api/recipe';
import {AxiosError} from 'axios';
import RecipeCard, {RecipeWithCategoriesIngredientsAuthorAndStars} from '@/components/recipe/RecipeCard';
import RecipeSkeletonCard from '@/components/recipe/RecipeSkeletonCard.tsx';

const RecipePage: React.FC = () => {
	const {id: recipeId} = useParams();
	const navigate = useNavigate();
	const [recipe, setRecipe] = useState<RecipeWithCategoriesIngredientsAuthorAndStars | null>(null);

	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const editedParam = searchParams.get('edited');

	useEffect(() => {
		if (recipeId == null) return;

		if (!Number.isInteger(Number(recipeId))) {
			return navigate('/');
		}

		getRecipeById(+recipeId)
			.then(({recipe}) => setRecipe(recipe))
			.catch((error) => {
				if (!(error instanceof AxiosError)) return;

				if (error?.response?.status === 404) {
					navigate('/');
				}
			});
	}, [recipeId, editedParam]);

	if (recipe == null) {
		return <RecipeSkeletonCard/>;
	}

	return <RecipeCard recipe={recipe}/>;
};

export default RecipePage;
