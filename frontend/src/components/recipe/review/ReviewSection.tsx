import React, {useEffect, useState} from 'react';
import {Box, Button, Divider, Grid, Typography} from '@mui/material';
import ReviewStars from '@/components/recipe/review/ReviewStars';
import theme from '@/theme';
import {RecipeWithCategoriesIngredientsAuthorAndStars} from '@/components/recipe/RecipeCard';
import ReviewComment from '@/components/recipe/review/ReviewComment';
import Review from '@/types/Review.ts';
import {getReviews, getStars} from '@/api/review';
import {AxiosError} from 'axios';
import ReviewCreate from '@/components/recipe/review/ReviewCreate.tsx';
import {useAuth} from '@/context/AuthContext';
import Stars from '@/types/Stars';
import ReviewCommentListPagination from '@/components/recipe/review/ReviewCommentListPagination';
import config from '@/config';

type ReviewSectionProps = {
	recipe: RecipeWithCategoriesIngredientsAuthorAndStars;
};

const ReviewSection: React.FC<ReviewSectionProps> = ({recipe}) => {
	const {currentUser} = useAuth();

	const [openReviews, setOpenReviews] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const [reviews, setReviews] = useState<Array<Review> | null>(null);
	const [currentUserReview, setCurrentUserReview] = useState<Review | null>(null);
	const [totalPages, setTotalPages] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const [stars, setStars] = useState<Stars | null>(null);

	if (currentUser == null) {
		return <></>;
	}

	useEffect(() => {
		if (loading) return;
		if (!openReviews) return;

		setLoading(true);

		getReviews({
			recipeId: recipe.id,
			page: currentPage,
			limit: config.APP.PAGINATION.RECIPES_PER_PAGE
		})
			.then(({reviews, currentUserReview, totalPages}) => {
				setTotalPages(totalPages);
				setReviews(reviews);
				setCurrentUserReview(currentUserReview);
			})
			.catch(error => {
				if (!(error instanceof AxiosError)) return;

				setReviews([]);
				setCurrentUserReview(error?.response?.data?.currentUserReview ?? null);

				if (error?.response?.data?.totalPages === 0) {
					setReviews([]);
					setTotalPages(0);

					return;
				}

				if (currentPage > totalPages) {
					setCurrentPage(totalPages);
				}
			})
			.finally(() => setLoading(false));
	}, [openReviews, currentPage]);

	const refreshStars = (forceRefresh?: boolean) => {
		if (!forceRefresh && stars != null) return;

		getStars(recipe.id)
			.then(({stars}) => setStars(stars))
			.catch(error => {
				if (!(error instanceof AxiosError)) return;
			});
	};

	const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
		setCurrentPage(page);
	}

	return <>
		<Grid container spacing={2}>
			<Grid item xs={12} md={6}>
				<ReviewStars stars={stars ?? recipe.stars}/>
			</Grid>
			<Grid item xs={12} md={6}>
				<Button variant="outlined"
				        style={{color: theme.palette.primary.main, borderColor: theme.palette.primary.main}}
				        size="small"
				        fullWidth
				        onClick={() => setOpenReviews(prev => !prev)}
				        disabled={loading}
				>
					Reviews
				</Button>
			</Grid>

			{openReviews && reviews &&
             <>
                 <Grid item xs={12}>
                     <Divider color="gray"/>

                     <Box p={3}>
								{recipe.author.id !== currentUser.id &&
                            <Box m={1}>
										 {currentUserReview ?
											 <ReviewComment
												 review={currentUserReview}
												 onUpdate={(review) => {
													 console.log('odswiezyc gwiazdki')
													 setCurrentUserReview(review);
													 refreshStars(true);
												 }}
											 /> :
											 <ReviewCreate
												 recipeId={recipe.id}
												 onCreate={(review) => {
													 setCurrentUserReview(review);
													 refreshStars(true);
												 }}
											 />
										 }
										 {reviews.length > 0 && <Divider sx={{margin: '1rem'}}/>}
                            </Box>
								}

								{reviews.length === 0 && currentUser.id === recipe.author.id &&
                            <Typography variant="subtitle1">No reviews yet...</Typography>
								}

                         <Box m={1}>
                             <ReviewCommentListPagination
                                 reviews={reviews}
                                 page={currentPage}
                                 count={Math.ceil(totalPages)}
                                 disablePagination={loading}
                                 handlePageChange={handlePageChange}
                             />
                         </Box>
                     </Box>
                 </Grid>
             </>
			}
		</Grid>


	</>;
};

export default ReviewSection;
