import React, {useState} from 'react';
import {
	Alert,
	Box,
	Card,
	CardContent,
	Typography
} from '@mui/material';
import RecipeToAddOrEdit from '@/types/RecipeToAddOrEdit';
import {createRecipe} from '@/api/recipe';
import {AxiosError} from 'axios';
import RecipeForm from '@/components/recipe/RecipeForm';
import ErrorFields from '@/types/ErrorFields';

const CreateRecipePage: React.FC = ({}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [resetForm, setResetForm] = useState<boolean>(false);
	const [successMessage, setSuccessMessage] = useState<string>('');
	const [errorFields, setErrorFields] = useState<ErrorFields>([]);

	const handleSubmit = (formData: RecipeToAddOrEdit) => {
		setLoading(true);

		createRecipe(formData)
			.then(res => {
				if (res?.success) {
					// reset all inputs to initial values
					setResetForm(true);

					// remove errors
					setErrorFields([]);

					// display success message
					setSuccessMessage(res?.message ?? 'Recipe has been created.');

					// hide success message after 8 seconds
					setTimeout(() => setSuccessMessage(''), 8_000);
				}
			})
			.catch(error => {
				if (!(error instanceof AxiosError)) return;

				setErrorFields(error?.response?.data?.errors ?? []);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return <Card>
		<CardContent>
			<Typography variant="h6" fontFamily="MonoSpace">New recipe</Typography>
			{successMessage && <Box my={1}>
             <Alert severity="success">{successMessage}</Alert>
         </Box>}

			<RecipeForm
				handleSubmit={handleSubmit}
				errorFields={errorFields}
				resetForm={resetForm}
				disableForm={loading}
			/>
		</CardContent>
	</Card>;
};

export default CreateRecipePage;
