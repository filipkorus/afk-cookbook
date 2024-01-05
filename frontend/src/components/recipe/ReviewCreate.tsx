import React, {useState} from 'react';
import {z} from 'zod';
import RecipeToAdd from '@/types/RecipeToAdd';
import useForm from '@/hooks/useForm';
import Textarea from '@mui/joy/Textarea';
import {Alert, Box, Button, Card, CardContent, FormGroup, Rating, TextField, Typography} from '@mui/material';
import theme from '@/theme';
import {AxiosError} from 'axios';
import {createReview} from '@/api/review';
import ReviewToAdd from '@/types/ReviewToAdd';
import config from '@/config';
import Review from '@/types/Review.ts';

type ReviewCreateProps = {
	recipeId: number;
	onCreate?: React.Dispatch<React.SetStateAction<Review | null>>
};

const ReviewCreate: React.FC<ReviewCreateProps> = ({recipeId, onCreate}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [errorFields, setErrorFields] = useState<Array<z.ZodIssue & { minimum?: number, maximum?: number }>>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const fieldError = (fieldName: keyof ReviewToAdd) => errorFields.find(error => error.path[0] === fieldName);

	const {formData, handleInputChange, setNewFormValues, resetForm} = useForm<ReviewToAdd>({
		stars: config.APP.RECIPE_REVIEW.STARS.DEFAULT,
		comment: ''
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setLoading(true);

		createReview({
			review: formData,
			recipeId
		})
			.then(({success, msg, data}) => {
				if (success) {
					// reset all inputs to initial values
					resetForm();

					// remove errors
					setErrorFields([]);
					setErrorMessage(null);

					onCreate && onCreate(data?.review);
				} else {
					setErrorMessage(msg);
				}
			})
			.catch(error => {
				if (!(error instanceof AxiosError)) return;

				setErrorFields(error?.response?.data?.errors ?? []);
				setErrorMessage(error?.response?.data?.msg);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return <form onSubmit={handleSubmit}>
		<Typography>Write your review</Typography>
		<FormGroup>
			{fieldError('stars') && <Box my={1}>
             <Alert severity="error">{fieldError('stars')?.message}</Alert>
         </Box>}

			{errorMessage != null && <Box my={1}>
             <Alert severity="error">{errorMessage}</Alert>
         </Box>}

			<Rating name="stars" value={formData.stars} onChange={(event: React.SyntheticEvent, value: number | null) => {
				setNewFormValues({
					...formData,
					stars: value == null ?
						config.APP.RECIPE_REVIEW.STARS.DEFAULT :
						value
				});
			}} max={config.APP.RECIPE_REVIEW.STARS.MAX} defaultValue={config.APP.RECIPE_REVIEW.STARS.DEFAULT}
			        precision={0.5}/>

			<TextField
				multiline
				maxRows={5}
				variant="outlined"
				label="Comment"
				name="comment"
				error={fieldError('comment') != null}
				helperText={fieldError('comment')?.message}
				onChange={handleInputChange}
				disabled={loading}
				inputProps={{
					maxLength: config.APP.RECIPE_REVIEW.COMMENT.LENGTH.MAX
				}}
				value={formData.comment}
				fullWidth
				sx={{mb: 2, mt: 1}}
			/>
		</FormGroup>

		<Button style={{color: theme.palette.primary.main, borderColor: theme.palette.primary.main}}
		        variant="outlined" type="submit"
		        disabled={loading} fullWidth>Submit</Button>
	</form>;
};

export default ReviewCreate;
