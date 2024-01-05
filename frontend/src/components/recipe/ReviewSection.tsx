import React, {useEffect, useState} from 'react';
import {Box, Button, Divider, Grid, Typography} from '@mui/material';
import ReviewStars from '@/components/recipe/ReviewStars.tsx';
import theme from '@/theme';
import {RecipeWithCategoriesIngredientsAuthorAndStars} from '@/components/recipe/RecipeCard.tsx';
import ReviewComment from '@/components/recipe/ReviewComment.tsx';
import Review from '@/types/Review.ts';
import {getReviews, getStars} from '@/api/review.ts';
import {v4 as uuidv4} from 'uuid';
import {AxiosError} from 'axios';
import ReviewCreate from '@/components/recipe/ReviewCreate.tsx';
import {useAuth} from '@/context/AuthContext.tsx';
import Stars from '@/types/Stars.ts';

type ReviewSectionProps = {
	recipe: RecipeWithCategoriesIngredientsAuthorAndStars;
};

const ReviewSection: React.FC<ReviewSectionProps> = ({recipe}) => {
	const {currentUser} = useAuth();

	const [openReviews, setOpenReviews] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const [reviews, setReviews] = useState<Array<Review> | null>(null);
	const [currentUserReview, setCurrentUserReview] = useState<Review | null>(null);

	const [stars, setStars] = useState<Stars | null>(null);

	if (currentUser == null) {
		return <></>;
	}

	useEffect(() => {
		if (reviews != null) return;
		if (loading) return;
		if (!openReviews) return;

		setLoading(true);

		getReviews({
			recipeId: recipe.id,
			page: 1,
			limit: 3
		})
			.then(({reviews, currentUserReview}) => {
				// setTotalPages(res.totalPages);
				setReviews(reviews);
				setCurrentUserReview(currentUserReview);
			})
			.catch(error => {
				if (!(error instanceof AxiosError)) return;

				setReviews([]);
				setCurrentUserReview(error?.response?.data?.currentUserReview ?? null);
			})
			.finally(() => setLoading(false));
	}, [openReviews]);

	useEffect(() => {
		if (stars != null) return;
		if (currentUserReview == null) return;

		getStars(recipe.id)
			.then(({stars}) => setStars(stars))
			.catch(error => {
				if (!(error instanceof AxiosError)) return;
			});
	}, [currentUserReview]);

	return <>
		<Grid container spacing={2} mb={1}>
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
		</Grid>

		{openReviews && reviews &&
          <>
				 <Divider color="gray"/>

              <Grid container spacing={2} justifyContent="center" m={1}>
                  <Grid item xs={12} md={12}>
							{recipe.author.id !== currentUser.id &&
                         <>
									 {currentUserReview ?
										 <Box>
											 <ReviewComment review={currentUserReview}/>
										 </Box> :
										 <Box>
											 <ReviewCreate recipeId={recipe.id} onCreate={setCurrentUserReview}/>
										 </Box>
									 }
	                         {reviews.length > 0 && <Divider sx={{marginTop: '1rem'}}/>}
                         </>
							}

							{reviews.length === 0 && currentUser.id === recipe.author.id && <Typography variant="subtitle1">No reviews yet...</Typography>}

							{reviews.map((review, idx) =>
								<Box key={uuidv4()}>
									<ReviewComment review={review}/>
									{idx !== reviews.length - 1 && <Divider sx={{margin: '1rem'}}/>}
								</Box>
							)}
                  </Grid>
              </Grid>
          </>
		}
	</>;
};

export default ReviewSection;
