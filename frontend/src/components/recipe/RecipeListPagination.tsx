import React from 'react';
import RecipeWallCard, {RecipeWithAuthor} from '@/components/recipe/RecipeWallCard.tsx';
import {v4 as uuidv4} from 'uuid';
import {Pagination, Typography} from '@mui/material';

type RecipeListPaginationProps = {
	recipes: Array<RecipeWithAuthor>,
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
				 </Typography>}
			{recipes.map(recipe => <RecipeWallCard recipe={recipe} key={uuidv4()}/>)}

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
