import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getRecipeById} from '@/api/recipe.ts';
import {AxiosError} from 'axios';
import {Avatar, Card, CardActions, CardContent, CardHeader, IconButton} from '@mui/material';
import timeSince from '@/utils/date/timeSince.ts';
import Recipe from '@/types/Recipe';
import User from '@/types/User';
import Category from '@/types/Category';
import Ingredient from '@/types/Ingredient';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

type RecipeWithCategoriesIngredientsAndAuthor = Recipe & {
	categories: Array<Category>,
	ingredients: Array<Ingredient>,
	author: Omit<User, 'email' | 'banned'>
};
type RecipeProps = {};

const RecipeCard: React.FC<RecipeProps> = ({}) => {
	const {id: recipeId} = useParams();
	const navigate = useNavigate();
	const [recipe, setRecipe] = useState<RecipeWithCategoriesIngredientsAndAuthor | null>(null);

	useEffect(() => {
		if (recipeId == null) return;

		getRecipeById(+recipeId)
			.then(({recipe}) => setRecipe(recipe))
			.catch(error => {
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

	return <Card>
		<CardHeader
			avatar={<Avatar aria-label="User" alt={recipe.author.name} src={recipe.author.picture}/>}
			title={`${recipe.author.name} | ${timeSince(recipe.createdAt)}`}
			subheader={recipe.location ?? ''}
		/>
		<CardContent>
			<pre>
		{JSON.stringify(recipe ?? {}, null, 3)}
	</pre>
		</CardContent>
		<CardActions disableSpacing>
			<IconButton aria-label="Like" title="Like">
				<ThumbUpIcon/>
			</IconButton>
			<IconButton aria-label="Dislike" title="Dislike">
				<ThumbDownIcon/>
			</IconButton>
		</CardActions>
	</Card>;
};

export default RecipeCard;
