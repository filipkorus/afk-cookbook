import React from 'react';
import {Avatar, Grid, Rating, Typography} from '@mui/material';
import Review from '@/types/Review.ts';
import {useNavigate} from 'react-router-dom';
import timeSince from '@/utils/date/timeSince.ts';
import {useAuth} from '@/context/AuthContext.tsx';

type ReviewCommentProps = {
	review: Review
};

const ReviewComment: React.FC<ReviewCommentProps> = ({review}) => {
	const navigate = useNavigate();
	const {currentUser} = useAuth();

	if (currentUser == null) {
		return <></>;
	}

	const authorProfileOnClick = () => navigate(`/recipe/user/${review.author.id}`);
	const authorProfileClickTitle = `Click to see profile of ${review.author.name}`;

	return <Grid container wrap="nowrap" spacing={2}>
		<Grid item>
			<Avatar alt={review.author.name}
			        src={review.author.picture}
			        sx={{cursor: 'pointer'}}
			        onClick={authorProfileOnClick}
			        title={authorProfileClickTitle}
			/>
		</Grid>
		<Grid justifyContent="left" item xs zeroMinWidth>
			<Typography m={0} textAlign="left" variant="subtitle2"
			            sx={{cursor: 'pointer'}}
			            onClick={authorProfileOnClick}
			            title={authorProfileClickTitle}
			>
				{currentUser.id === review.author.id ? 'You' : review.author.name} | {timeSince(review.createdAt)} ago
			</Typography>

			<Rating defaultValue={0.0} value={review.stars} precision={0.5} size="small" readOnly/>

			{review.comment !== '' &&
             <Typography textAlign="left">
					 {review.comment}
             </Typography>
			}
		</Grid>
	</Grid>;
};

export default ReviewComment;
