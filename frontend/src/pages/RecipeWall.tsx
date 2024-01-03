import React, {useEffect, useState} from 'react';
import {RecipeWithAuthor} from '@/components/recipe/RecipeWallCard.tsx';
import {useLocation, useNavigate} from 'react-router-dom';
import {getRecipes} from '@/api/recipe.ts';
import {useAuth} from '@/context/AuthContext.tsx';
import RecipeListPagination from '@/components/recipe/RecipeListPagination.tsx';
import {Box, Checkbox, FormControlLabel, FormGroup} from '@mui/material';
import config from '@/config';
import {AxiosError} from 'axios';

const RecipeWall: React.FC = () => {
	const {currentUser} = useAuth();

	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const navigate = useNavigate();

	const [includeMyRecipes, setIncludeMyRecipes] = useState<boolean>(false);

	const [loading, setLoading] = useState<boolean>(false);
	const [recipes, setRecipes] = useState<Array<RecipeWithAuthor> | null>(null);
	const [totalPages, setTotalPages] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(Math.max(1, +(query.get('p') ?? config.APP.PAGINATION.STARTING_PAGE_NUMBER)));

	const getRecipesHandler = () => {
		setLoading(true);

		getRecipes({
			page: currentPage,
			limit: config.APP.PAGINATION.RECIPES_PER_PAGE,
			excludeMyRecipes: !includeMyRecipes
		})
			.then(res => {
				setTotalPages(res.totalPages);
				setRecipes(res.recipes);
			})
			.catch(error => {
				if (!(error instanceof AxiosError)) return;

				console.error(error);

				const {totalPages} = error?.response?.data;

				if (totalPages === 0) {
					setRecipes([]);
					setTotalPages(0);

					return;
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

		getRecipesHandler();
	}, [currentPage, includeMyRecipes]);

	useEffect(() => {
		query.set('p', currentPage.toString());
		navigate(`?${query.toString()}`);
	}, [currentPage]);

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

export default RecipeWall;
