import React, {useEffect, useState} from 'react';
import {Navigate, useLocation, useNavigate, useParams} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import config from '@/config';
import {Box, Checkbox, FormControlLabel, FormGroup} from '@mui/material';
import RecipeListPagination from '@/components/recipe/RecipeListPagination';
import {getRecipesByUserId} from '@/api/recipe';
import {AxiosError} from 'axios';
import {RecipeWithCategoriesIngredientsAuthorAndStars} from '@/components/recipe/RecipeCard';

const RecipesOfUserPage: React.FC = () => {
	const {id: userId} = useParams();

	const {currentUser} = useAuth();

	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const navigate = useNavigate();

	const [includePrivate, setIncludePrivate] = useState<boolean>(true);
	const [includePublic, setIncludePublic] = useState<boolean>(true);

	const [loading, setLoading] = useState<boolean>(false);
	const [recipes, setRecipes] = useState<Array<RecipeWithCategoriesIngredientsAuthorAndStars> | null>(null);
	const [totalPages, setTotalPages] = useState<number>(0);
	const pParam = query.get('p');
	const [currentPage, setCurrentPage] = useState<number>(
		Math.max(1, Math.floor(
			(pParam == null || !Number.isInteger(Number(pParam)) ?
					1 :
					+pParam
			))));

	if (!Number.isInteger(Number(userId))) {
		return <Navigate to="/"/>;
	}

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
			.catch(error => {
				if (!(error instanceof AxiosError)) return;

				console.error(error);

				if (error?.response?.data?.totalPages === 0) {
					setRecipes([]);
					setTotalPages(0);

					return;
				}

				if (currentPage > error?.response?.data?.totalPages) {
					setCurrentPage(error?.response?.data?.totalPages);
				}
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

	useEffect(() => {
		setRecipes(null);
	}, [currentPage]);

	const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
		setCurrentPage(page);
	}

	if (currentUser == null || userId == null) {
		return <></>;
	}

	return <>

		{(+userId) === currentUser.id &&
          <Box mx={2}>
              <FormGroup>
                  <FormControlLabel
                      control={
								 <Checkbox
									 onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										 setRecipes(null);

										 const {checked} = e.target;
										 setIncludePublic(checked);
										 if (checked) {
											 return;
										 }
										 if (!includePrivate) setIncludePrivate(true);
									 }}
									 checked={includePublic}
									 disabled={loading}
								 />
							 }
                      label="Show my public recipes"
                  />

                  <FormControlLabel
                      control={
								 <Checkbox
									 onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										 setRecipes(null);

										 const {checked} = e.target;
										 setIncludePrivate(checked);
										 if (checked) {
											 return;
										 }
										 if (!includePublic) setIncludePublic(true);
									 }}
									 checked={includePrivate}
									 disabled={loading}
								 />
							 }
                      label="Show my private recipes"
                  />
              </FormGroup>
          </Box>}

		<RecipeListPagination
			recipes={recipes}
			disablePagination={loading}
			count={Math.ceil(totalPages)}
			page={currentPage}
			handlePageChange={handlePageChange}
		/>
	</>;
};

export default RecipesOfUserPage;
