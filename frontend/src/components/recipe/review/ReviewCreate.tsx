import React, {useState} from 'react';
import {z} from 'zod';
import {AxiosError} from 'axios';
import {createReview} from '@/api/review';
import ReviewToAdd from '@/types/ReviewToAdd';
import Review from '@/types/Review';
import ReviewForm from '@/components/recipe/review/ReviewForm';


type ReviewCreateProps = {
	recipeId: number;
	onCreate?: (currentUserComment: Review) => any
};

const ReviewCreate: React.FC<ReviewCreateProps> = ({
	                                                   recipeId,
	                                                   onCreate
                                                   }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [errorFields, setErrorFields] = useState<Array<z.ZodIssue & { minimum?: number, maximum?: number }>>([]);
	const [errorMessage, setErrorMessage] = useState<string>('');

	const handleSubmit = (formData: ReviewToAdd) => {
		setLoading(true);

		createReview({
			review: formData,
			recipeId
		})
			.then(({success, msg, data}) => {
				if (success) {
					// remove errors
					setErrorFields([]);
					setErrorMessage('');

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
			.finally(() => setLoading(false));
	};

	return <ReviewForm
		action="create"
		onSubmit={handleSubmit}
		disableForm={loading}
		errorFields={errorFields}
		errorMessage={errorMessage}
	/>;
};

export default ReviewCreate;
