import React from 'react';
import {Alert, Box, Button, FormGroup, Rating, TextField, Typography} from '@mui/material';
import config from '@/config';
import theme from '@/theme';
import {z} from 'zod';
import ReviewToAdd from '@/types/ReviewToAdd';
import useForm from '@/hooks/useForm';
import Review from '@/types/Review';

type Action = 'create' | 'edit';
type ReviewFormProps = {
	action: Action,
	onSubmit: (formData: ReviewToAdd) => any,
	onCancel?: () => any,
	defaultInputValues?: Pick<Review, 'stars' | 'comment'>,
	disableForm: boolean,
	errorFields: Array<z.ZodIssue & { minimum?: number, maximum?: number }>,
	errorMessage: string
};

const ReviewForm: React.FC<ReviewFormProps> = ({
	                                               action,
	                                               onSubmit,
	                                               onCancel,
	                                               defaultInputValues,
	                                               disableForm,
	                                               errorFields,
	                                               errorMessage
                                               }) => {
	const fieldError = (fieldName: keyof ReviewToAdd) => errorFields?.find(error => error.path[0] === fieldName);

	const {formData, handleInputChange, setNewFormValues, resetForm} = useForm<ReviewToAdd>({
		stars: defaultInputValues?.stars ?? config.APP.RECIPE_REVIEW.STARS.DEFAULT,
		comment: defaultInputValues?.comment ?? ''
	});

	const _handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmit && onSubmit(formData);
	};
	return <form onSubmit={_handleSubmit}>
		<Typography>{action === 'edit' ? 'Edit' : 'Write'} your review</Typography>
		<FormGroup>
			{(fieldError('stars') || (errorMessage != null && errorMessage !== '')) && <Box my={1}>
             <Alert severity="error">{fieldError('stars')?.message ?? errorMessage}</Alert>
         </Box>}

			<Rating
				name="stars"
				value={formData.stars}
				onChange={
					(event: React.SyntheticEvent, value: number | null) => {
						if (
							value == null ||
							value < config.APP.RECIPE_REVIEW.STARS.MIN ||
							value > config.APP.RECIPE_REVIEW.STARS.MAX
						) return;

						setNewFormValues({
							...formData,
							stars: value
						});
					}
				} max={config.APP.RECIPE_REVIEW.STARS.MAX} defaultValue={config.APP.RECIPE_REVIEW.STARS.DEFAULT}
				precision={1}/>

			<TextField
				multiline
				maxRows={5}
				variant="outlined"
				label={'Comment' + (formData.comment.trim().length > 0 ? ` (${formData.comment.trim().length}/${config.APP.RECIPE_REVIEW.COMMENT.LENGTH.MAX})` : '')}
				name="comment"
				error={fieldError('comment') != null}
				helperText={fieldError('comment')?.message}
				onChange={handleInputChange}
				disabled={disableForm}
				inputProps={{
					maxLength: config.APP.RECIPE_REVIEW.COMMENT.LENGTH.MAX
				}}
				value={formData.comment}
				fullWidth
				sx={{mb: 2, mt: 2}}
			/>
		</FormGroup>

		<Button style={{color: theme.palette.primary.main, borderColor: theme.palette.primary.main}}
		        variant="outlined" type="submit"
		        disabled={disableForm} fullWidth>
			{action === 'edit' ? 'Save changes' : 'Submit'}
		</Button>

		{action === 'edit' && <Box my={1}>
          <Button
              variant="outlined" type="button"
              color="error"
              onClick={() => onCancel && onCancel()}
              disabled={disableForm} fullWidth>
              Cancel
          </Button>
      </Box>}
	</form>;
};

export default ReviewForm;
