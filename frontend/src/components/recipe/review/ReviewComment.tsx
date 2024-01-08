import React, {useState} from 'react';
import {Avatar, Box, Button, Grid, Rating, Typography} from '@mui/material';
import Review from '@/types/Review';
import {useNavigate} from 'react-router-dom';
import timeSince from '@/utils/date/timeSince'
import {useAuth} from '@/context/AuthContext';
import ReviewForm from '@/components/recipe/review/ReviewForm';
import ReviewToAdd from '@/types/ReviewToAdd';
import {deleteReview, editReview} from '@/api/review';
import {z} from 'zod';
import {AxiosError} from 'axios';

type ReviewCommentProps = {
	review: Review,
	onUpdate?: (currentUserComment: Review | null) => any
};

const ReviewComment: React.FC<ReviewCommentProps> = ({review, onUpdate}) => {
	const navigate = useNavigate();
	const {currentUser} = useAuth();

	const [editing, setEditing] = useState<boolean>(false);

	const [loading, setLoading] = useState<boolean>(false);
	const [errorFields, setErrorFields] = useState<Array<z.ZodIssue & { minimum?: number, maximum?: number }>>([]);
	const [errorMessage, setErrorMessage] = useState<string>('');

	if (currentUser == null) {
		return <></>;
	}

	const handleEditSubmit = (formData: ReviewToAdd) => {
		if (loading) return;

		editReview({
			review: formData,
			reviewId: review.id
		})
			.then(({success, msg, review}) => {
				if (success) {
					// remove errors
					setErrorFields([]);
					setErrorMessage('');

					onUpdate && onUpdate(review);
					setEditing(false);
				} else {
					setErrorMessage(msg);
				}
			})
			.catch(error => {
				if (!(error instanceof AxiosError)) return;

				setErrorFields(error?.response?.data?.errors ?? []);
				setErrorMessage(error?.response?.data?.msg ?? 'Error');
			})
			.finally(() => setLoading(false));
	};

	const handleDeleteSubmit = () => {
		if (loading) return;

		const deletingConfirmed = confirm('Are you sure to delete your review?');

		if (!deletingConfirmed) return;

		deleteReview(review.id)
			.then(({success, msg}) => {
				if (success) {
					onUpdate && onUpdate(null);
				} else {
					alert(msg ?? 'Server error');
				}
			})
			.catch(error => {
				if (!(error instanceof AxiosError)) return;

				setErrorFields(error?.response?.data?.errors ?? []);
				alert(error?.response?.data?.msg ?? 'Server error');
			})
			.finally(() => setLoading(false));
	}

	const authorProfileOnClick = () => navigate(`/recipe/user/${review.author.id}`);
	const authorProfileClickTitle = `Click to see profile of ${review.author.name}`;

	return <>
		{editing ?
			<ReviewForm
				action="edit"
				defaultInputValues={{
					stars: review.stars,
					comment: review.comment
				}}
				onSubmit={handleEditSubmit}
				onCancel={() => setEditing(false)}
				errorMessage={errorMessage}
				errorFields={errorFields}
				disableForm={loading}
			/> :
			<Grid container wrap="nowrap" spacing={2}>
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

					{currentUser.id === review.author.id && <Box display="inline" my={2} ml={1}>
                   <Button size="small"
                           title="Edit"
                           onClick={() => setEditing(true)}
                           disabled={loading}
                   >
                       Edit
                   </Button>
                   <Button size="small"
                           title="Delete"
                           color="error"
                           onClick={handleDeleteSubmit}
                           disabled={loading}
                   >
                       Delete
                   </Button>
               </Box>}

					{review.comment !== '' &&
                   <Typography textAlign="left">
							 {review.comment}
                   </Typography>
					}
				</Grid>
			</Grid>
		}
	</>;
};

export default ReviewComment;
