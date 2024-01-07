import React from 'react';
import Review from '@/types/Review';
import {Box, Divider, Pagination} from '@mui/material';
import {v4 as uuidv4} from 'uuid';
import ReviewComment from '@/components/recipe/review/ReviewComment.tsx';

type ReviewCommentListPaginationProps = {
	reviews: Array<Review>,
	disablePagination?: boolean,
	page: number,
	count: number,
	handlePageChange: (event: React.ChangeEvent<unknown>, page: number) => void
};

const ReviewCommentListPagination: React.FC<ReviewCommentListPaginationProps> = ({
	                                                                                 reviews,
	                                                                                 disablePagination,
	                                                                                 page,
	                                                                                 count,
	                                                                                 handlePageChange
                                                                                 }) => {
	return <Box>

		{reviews.map((review, idx) => <Box mt={1} mb={3} key={uuidv4()}>
				<ReviewComment review={review}/>
				{idx !== reviews.length - 1 && <Divider sx={{margin: '1rem'}}/>}
			</Box>
		)}

		<Pagination
			disabled={disablePagination}
			count={count}
			page={page}
			onChange={handlePageChange}
		/>
	</Box>;
};

export default ReviewCommentListPagination;
