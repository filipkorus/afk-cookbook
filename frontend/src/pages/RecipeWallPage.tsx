import React, {useEffect, useState} from 'react';
import {Navigate, useLocation, useNavigate, useParams} from 'react-router-dom';
import {getRecipes, getRecipesByCategoriesOrIngredients} from '@/api/recipe';
import {useAuth} from '@/context/AuthContext';
import RecipeListPagination from '@/components/recipe/RecipeListPagination';
import {Box, Checkbox, FormControlLabel, FormGroup} from '@mui/material';
import config from '@/config';
import {AxiosError} from 'axios';
import {RecipeWithCategoriesIngredientsAuthorAndStars} from '@/components/recipe/RecipeCard';

type Wall = 'main' | 'category' | 'ingredient';

type RecipeWallPageProps = {
	wallType?: Wall
};

const RecipeWallPage: React.FC<RecipeWallPageProps> = ({wallType}) => {
	const {currentUser} = useAuth();
	const {name, commaSeparatedNames} = useParams();

	const names = commaSeparatedNames
		?.split(',')
		.map(name => name.trim())
		.filter(name => name !== '');

	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const navigate = useNavigate();

	const [includeMyRecipes, setIncludeMyRecipes] = useState<boolean>(false);

	const [loading, setLoading] = useState<boolean>(false);
	const [recipes, setRecipes] = useState<Array<RecipeWithCategoriesIngredientsAuthorAndStars> | null>(null);
	const [totalPages, setTotalPages] = useState<number>(config.APP.PAGINATION.STARTING_PAGE_NUMBER);
	const [currentPage, setCurrentPage] = useState<number>(Math.max(1, +(query.get('p') ?? config.APP.PAGINATION.STARTING_PAGE_NUMBER)));

	const getRecipesHandler = () => {
		setLoading(true);

		const query = names != null ?
			getRecipesByCategoriesOrIngredients({
				page: currentPage,
				limit: config.APP.PAGINATION.RECIPES_PER_PAGE,
				excludeMyRecipes: !includeMyRecipes,
				names,
				searchType: wallType === 'category' ? 'categories' : 'ingredients'
			}) :
			getRecipes({
				page: currentPage,
				limit: config.APP.PAGINATION.RECIPES_PER_PAGE,
				excludeMyRecipes: !includeMyRecipes,
				ingredientName: wallType === 'ingredient' ? name : undefined,
				categoryName: wallType === 'category' ? name : undefined,
			});

		query
			.then(res => {
				setTotalPages(res.totalPages);
				setRecipes(res.recipes);
			})
			.catch(error => {
				if (!(error instanceof AxiosError)) return;

				if (error?.response?.data?.totalPages === 0) {
					setRecipes([]);
					setTotalPages(0);

					return;
				}

				if (error?.response?.status === 404) {
					return alert('No recipes matching given criteria found!');
				}

				if (currentPage > totalPages) {
					setCurrentPage(totalPages);
				}
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		if (loading) return;
		if (names?.length === 1) return;

		getRecipesHandler();
	}, [currentPage, includeMyRecipes, name]);

	useEffect(() => {
		if (names?.length === 1) return;

		query.set('p', currentPage.toString());
		navigate(`?${query.toString()}`);
	}, [currentPage]);

	if (names?.length === 1) {
		return <Navigate to={`/${wallType}/${names[0]}`}/>;
	}

	const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
		setCurrentPage(page);
	}

	if (recipes == null || currentUser == null) {
		return <></>;
	}

	return <>
		<Box mx={2}>
			<FormGroup>
				<FormControlLabel
					control={
						<Checkbox
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								const {checked} = e.target;
								setIncludeMyRecipes(checked);
								if (checked) {
									return;
								}
								setCurrentPage(config.APP.PAGINATION.STARTING_PAGE_NUMBER);
							}}
							checked={includeMyRecipes}
						/>
					}
					label="Show my public recipes"
				/>
			</FormGroup>
		</Box>

		<RecipeListPagination
			recipes={recipes ?? []}
			disablePagination={loading}
			count={Math.ceil(totalPages)}
			page={currentPage}
			handlePageChange={handlePageChange}
		/>
	</>;
};

export default RecipeWallPage;
