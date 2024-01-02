import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecipeById } from '@/api/recipe.ts';
import { AxiosError } from 'axios';
import {
    Avatar,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    IconButton,
    Checkbox,
    Typography,
} from '@mui/material';
import timeSince from '@/utils/date/timeSince.tsx';
import Recipe from '@/types/Recipe';
import User from '@/types/User';
import Category from '@/types/Category';
import Ingredient from '@/types/Ingredient';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

type RecipeWithCategoriesIngredientsAndAuthor = Recipe & {
    categories: Array<Category>;
    ingredients: Array<Ingredient>;
    author: Omit<User, 'email' | 'banned'>;
};

type RecipeProps = {};

const RecipeCard: React.FC<RecipeProps> = ({}) => {
    const { id: recipeId } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState<RecipeWithCategoriesIngredientsAndAuthor | null>(null);
    const [checkedIngredients, setCheckedIngredients] = useState<Array<number>>([]);

    useEffect(() => {
        if (recipeId == null) return;

        getRecipeById(+recipeId)
            .then(({ recipe }) => setRecipe(recipe))
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

    const handleIngredientToggle = (ingredientId: number) => {
        if (checkedIngredients.includes(ingredientId)) {
            setCheckedIngredients(checkedIngredients.filter((id) => id !== ingredientId));
        } else {
            setCheckedIngredients([...checkedIngredients, ingredientId]);
        }
    };

    return (
        <Card>
            <CardHeader
                avatar={<Avatar aria-label="User" alt={recipe.author.name} src={recipe.author.picture} />}
                title={`${recipe.author.name} | ${timeSince(recipe.createdAt)} ago`}
                subheader={recipe.location ? recipe.location.charAt(0).toUpperCase() + recipe.location.slice(1) : ''}
            />
            <CardContent>
                <Typography component="div" style={{ fontSize: '26px', fontFamily: 'cursive' }}>
                    {recipe.title ? recipe.title.charAt(0).toUpperCase() + recipe.title.slice(1) : ''}
                </Typography>
                <Typography style={{ fontSize: '16px', fontFamily: 'cursive' }}>
                    Time: {recipe.cookingTimeMinutes} min
                </Typography>
                <Typography style={{ fontSize: '16px', listStyleType: 'none' }}>
                    Ingredients:
                    <ul style={{ paddingLeft: 0, marginTop: 0 }}>
                        {recipe.ingredients.map((ingredient) => (
                            <li
                                key={ingredient.id}
                                style={{
                                    listStyleType: 'none',
                                    textDecoration: checkedIngredients.includes(ingredient.id) ? 'line-through' : 'none',
                                }}
                            >
                                <Checkbox
                                    checked={checkedIngredients.includes(ingredient.id)}
                                    onChange={() => handleIngredientToggle(ingredient.id)}
                                />
                                {ingredient.name}
                            </li>
                        ))}
                    </ul>
                </Typography>
                <Typography style={{ fontSize: '16px' }}>{recipe.description}</Typography>
                <footer style={{ color: 'lightgray' }}>
                    {recipe.categories.length > 1 ? 'Categories:' : 'Category:'}{' '}
                    {recipe.categories.map((category, index) => (
                        <span key={category.id}>
              {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                            {index < recipe.categories.length - 1 && ', '}
            </span>
                    ))}
                </footer>
            </CardContent>
            <CardActions disableSpacing>
                <IconButton aria-label="Like" title="Like">
                    <ThumbUpIcon />
                </IconButton>
                <IconButton aria-label="Dislike" title="Dislike">
                    <ThumbDownIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default RecipeCard;
