import React, {useState} from 'react';
import {
	Avatar,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Checkbox,
	Typography,
	Box, FormControlLabel, Grid, Button,
} from '@mui/material';
import timeSince from '@/utils/date/timeSince';
import Recipe from '@/types/Recipe';
import User from '@/types/User';
import Category from '@/types/Category';
import Ingredient from '@/types/Ingredient';
import theme from '@/theme';
import Stars from '@/types/Stars';
import ReviewSection from '@/components/recipe/review/ReviewSection';
import RouterLink from '@/components/routing/RouterLink';
import LockIcon from '@mui/icons-material/Lock';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import EditRecipe from './EditRecipe';

export type RecipeWithCategoriesIngredientsAuthorAndStars = Recipe & {
	categories: Array<Category>;
	ingredients: Array<Ingredient>;
	author: Omit<User, 'email' | 'banned'>;
	stars: Stars
};

type RecipeCardProps = {
	recipe: RecipeWithCategoriesIngredientsAuthorAndStars;
	wallCard?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({recipe, wallCard}) => {
	const {id: userId} = useParams();

	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const actionParam = searchParams.get('action');

	const {currentUser} = useAuth();
	const navigate = useNavigate();
	const [checkedIngredients, setCheckedIngredients] = useState<Array<number>>([]);

	const handleIngredientToggle = (ingredientId: number) => {
		if (checkedIngredients.includes(ingredientId)) {
			setCheckedIngredients(checkedIngredients.filter((id) => id !== ingredientId));
		} else {
			setCheckedIngredients([...checkedIngredients, ingredientId]);
		}
	};

	if (currentUser == null) {
		return <></>;
	}

	const alreadyViewingAuthorProfile = +(userId ?? 0) === recipe.author.id;
	const authorProfileOnClick = alreadyViewingAuthorProfile ?
		() => {
		} :
		() => navigate(`/recipe/user/${recipe.author.id}`);
	const authorProfileClickTitle = alreadyViewingAuthorProfile ? '' : `Click to see profile of ${recipe.author.name}`;

	return <>{actionParam === 'edit' && recipe.author.id === currentUser.id ?
		<EditRecipe recipeToEdit={recipe}/> :
		<Card>
			<CardHeader
				avatar={<Avatar
					aria-label="User"
					alt={recipe.author.name}
					src={recipe.author.picture}
					sx={{cursor: alreadyViewingAuthorProfile ? '' : 'pointer'}}
					onClick={authorProfileOnClick}
					title={authorProfileClickTitle}
				/>}
				subheader={recipe.location ? recipe.location.charAt(0).toUpperCase() + recipe.location.slice(1) : ''}
				title={
					<Typography
						variant="subtitle2"
						sx={{cursor: alreadyViewingAuthorProfile ? '' : 'pointer'}}
						onClick={authorProfileOnClick}
						title={authorProfileClickTitle}
					>
						{recipe.author.id === currentUser.id ? 'You' : recipe.author.name} | {timeSince(recipe.createdAt)} ago
					</Typography>
				}
			/>
			<CardContent sx={{padding: '0 1.4rem 0 1.4rem'}}>
				<Grid container>
					<Grid item xs={12} md={9}>
						<Typography fontSize="1.65rem" fontFamily="Monospace">
							{recipe.title ? recipe.title.charAt(0).toUpperCase() + recipe.title.slice(1) : ''}
						</Typography>
					</Grid>

					{recipe.author.id === currentUser.id &&
                   <Grid item xs={recipe.isPublic ? 3 : 2} textAlign="right">
                       <Button title="Edit this recipe" onClick={() => navigate(`/recipe/${recipe.id}?action=edit`)}>
                           Edit
                       </Button>
                   </Grid>
					}

					{!recipe.isPublic &&
                   <Grid item xs={1} textAlign="center">
                       <LockIcon titleAccess="This recipe is private"/>
                   </Grid>
					}
				</Grid>

				<Typography color="gray">
					{recipe.categories.length > 1 ? 'Categories: ' : 'Category: '}
					{recipe.categories
						.map((category, idx) => <span
							key={idx}
							style={{cursor: 'pointer'}}
							onClick={() => navigate(`/category/${encodeURIComponent(category.name.toLowerCase())}`)}
							title={`Click to view recipes with category '${category.name.charAt(0).toUpperCase() + category.name.slice(1)}'`}
						>
						{category.name.charAt(0).toUpperCase() + category.name.slice(1) + `${idx === recipe.categories.length - 1 ? '' : ','} `}
					</span>)
					}
				</Typography>

				{wallCard && <Typography color="gray">
                Ingredient{recipe.ingredients.length > 1 && 's'}:
					{' '}
					{recipe.ingredients
						.map((ingredient, idx) => <span
							key={idx}
							style={{cursor: 'pointer'}}
							onClick={() => navigate(`/ingredient/${encodeURIComponent(ingredient.name.toLowerCase())}`)}
							title={`Click to view recipes with ingredient '${ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1)}'`}
						>
						{ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1) + `${idx === recipe.ingredients.length - 1 ? '' : ','} `}
					</span>)
					}
            </Typography>}

				<Typography fontFamily="Monospace" my={1}>
					Time: {recipe.cookingTimeMinutes} min
				</Typography>

				{!wallCard &&
                <Box sx={{
						 border: `1.5px solid ${theme.palette.primary.main}`,
						 paddingLeft: '5px',
						 paddingTop: '10px',
						 borderRadius: '10px'
					 }} my={2}>
                    <Typography fontSize="1.1rem" fontFamily="Monospace" my={1} mx={2}>
                        Ingredients:
                    </Typography>
                    <ul style={{marginTop: 5}}>
							  {recipe.ingredients.map((ingredient, idx) => (
								  <li
									  key={idx}
									  style={{listStyleType: 'none'}}
								  >
									  <FormControlLabel control={
										  <Checkbox
											  checked={checkedIngredients.includes(idx)}
											  onChange={() => handleIngredientToggle(idx)}
										  />
									  } label={
										  <span style={{
											  textDecoration: checkedIngredients.includes(idx) ?
												  'line-through' :
												  'none'
										  }}>{ingredient.name}</span>
									  }/>
								  </li>
							  ))}
                    </ul>
                </Box>
				}

				{wallCard ?
					<>
						<Typography variant="body1" color="textPrimary" component="p" p={2}>
							{recipe.description.slice(0, 100)}{recipe.description.length > 100 && <>...</>}
						</Typography>

						<Box my={2}>
							<RouterLink to={`/recipe/${recipe.id}`}>
								<Button variant="outlined"
								        style={{color: theme.palette.primary.main, borderColor: theme.palette.primary.main}}
								        size="small" fullWidth>See full recipe</Button>
							</RouterLink>
						</Box>
					</> :
					<Box p={2}>
						<Typography component="p" fontSize="1.1rem">{recipe.description}</Typography>
					</Box>
				}
			</CardContent>

			<CardActions sx={{padding: '1.4rem', display: 'block'}}>
				<ReviewSection recipe={recipe}/>
			</CardActions>
		</Card>
	}</>;
};

export default RecipeCard;
