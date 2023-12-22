import React, {useEffect, useState} from 'react';
import RecipeWallCard, {RecipeWithAuthor} from '@/components/recipe/RecipeWallCard.tsx';
import {v4 as uuidv4} from 'uuid';
import {useLocation, useNavigate} from 'react-router-dom';
import {getRecipes} from '@/api/recipe.ts';
import {Pagination} from '@mui/material';
import {useAuth} from '@/context/AuthContext.tsx';

const RecipeWall: React.FC = () => {
	const {currentUser} = useAuth();

	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const navigate = useNavigate();

	const recipesPerPage = 3;
	const excludeMyRecipes = false;

	const [loading, setLoading] = useState<boolean>(false);
	const [recipes, setRecipes] = useState<Array<RecipeWithAuthor> | null>(null);
	const [totalPages, setTotalPages] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(+(query.get('p') ?? 1));

	const getRecipesHandler = () => {
		setLoading(true);

		getRecipes({
			page: currentPage,
			limit: recipesPerPage,
			excludeMyRecipes
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
		if (loading) return;

		getRecipesHandler();
	}, [currentPage]);

	const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
		setCurrentPage(page);
		query.set('p', page.toString());
		navigate(`?${query.toString()}`);
	}

	if (recipes == null || currentUser == null) {
		return <></>;
	}

	return <>
		<div>
			{recipes.map(recipe => <RecipeWallCard recipe={recipe} key={uuidv4()}/>)}

			<Pagination
				disabled={loading}
				count={Math.ceil(totalPages)}
				page={currentPage}
				onChange={handlePageChange}
			/>
		</div>
	</>;
};

export default RecipeWall;
