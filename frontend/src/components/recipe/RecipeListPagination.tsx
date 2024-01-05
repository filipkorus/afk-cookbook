import React from 'react';
import {v4 as uuidv4} from 'uuid';
import {Box, Pagination, Typography} from '@mui/material';
import RecipeCard, {RecipeWithCategoriesIngredientsAuthorAndStars} from '@/components/recipe/RecipeCard.tsx';

type RecipeListPaginationProps = {
	recipes: Array<RecipeWithCategoriesIngredientsAuthorAndStars>,
	disablePagination?: boolean,
	page: number,
	count: number,
	handlePageChange: (event: React.ChangeEvent<unknown>, page: number) => void
};

const RecipeListPagination: React.FC<RecipeListPaginationProps> = ({
	                                                                   recipes,
	                                                                   disablePagination,
	                                                                   page,
	                                                                   count,
	                                                                   handlePageChange
                                                                   }) => {
	return <>
		<div>
			{recipes.length === 0 &&
             <Typography variant="h6" m={2}>
                 Nothing to show...
             </Typography>
			}

			{recipes.map(recipe => <Box mt={1} mb={3} key={uuidv4()}>
					<RecipeCard recipe={recipe} wallCard/>
				</Box>
			)}

			<Pagination
				disabled={disablePagination}
				count={count}
				page={page}
				onChange={handlePageChange}
			/>
		</div>
	</>;
};

export default RecipeListPagination;
