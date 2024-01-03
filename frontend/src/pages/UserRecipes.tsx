import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext.tsx';
import {RecipeWithAuthor} from '@/components/recipe/RecipeWallCard.tsx';
import config from '@/config';
import {Box, Checkbox, FormControlLabel, FormGroup} from '@mui/material';
import RecipeListPagination from '@/components/recipe/RecipeListPagination.tsx';
import {getRecipesByUserId} from '@/api/recipe.ts';

const UserRecipes: React.FC = () => {
	const {id: userId} = useParams();

	const {currentUser} = useAuth();

	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const navigate = useNavigate();

	const [includePrivate, setIncludePrivate] = useState<boolean>(true);
	const [includePublic, setIncludePublic] = useState<boolean>(true);

	const [loading, setLoading] = useState<boolean>(false);
	const [recipes, setRecipes] = useState<Array<RecipeWithAuthor> | null>(null);
	const [totalPages, setTotalPages] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(
		Math.max(1, +(query.get('p') ?? 1)));

	const getRecipesByUserIdHandler = () => {
		if (userId == null) return;

		setLoading(true);

		getRecipesByUserId({
			page: currentPage,
			limit: config.APP.PAGINATION.RECIPES_PER_PAGE,
			includePrivate,
			includePublic,
			userId: +userId
		})
			.then(res => {
				setTotalPages(res.totalPages);
				setRecipes(res.recipes);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		if (userId == null) return;
		if (loading) return;

		getRecipesByUserIdHandler();
	}, [currentPage, userId, includePublic, includePrivate]);

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
								setIncludePublic(checked);
								if (checked) {
									return;
								}
								if (!includePrivate) setIncludePrivate(true);
							}}
							checked={includePublic}
						/>
					}
					label="Show my public recipes"
				/>

				<FormControlLabel
					control={
						<Checkbox
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								const {checked} = e.target;
								setIncludePrivate(checked);
								if (checked) {
									return;
								}
								if (!includePublic) setIncludePublic(true);
							}}
							checked={includePrivate}
						/>
					}
					label="Show my private recipes"
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

export default UserRecipes;