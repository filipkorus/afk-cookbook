import React, {useState} from 'react';
import {
	Alert,
	Box,
	Card,
	CardContent,
	Typography
} from '@mui/material';
import RecipeToAddOrEdit from '@/types/RecipeToAddOrEdit';
import {updateRecipe} from '@/api/recipe';
import {AxiosError} from 'axios';
import RecipeForm from '@/components/recipe/RecipeForm';
import ErrorFields from '@/types/ErrorFields';
import {RecipeWithCategoriesIngredientsAuthorAndStars} from '@/components/recipe/RecipeCard';
import {useNavigate} from 'react-router-dom';

type EditRecipeProps = {
	recipeToEdit: RecipeWithCategoriesIngredientsAuthorAndStars
};

const EditRecipe: React.FC<EditRecipeProps> = ({recipeToEdit}) => {
	const navigate = useNavigate();

	const [loading, setLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [errorFields, setErrorFields] = useState<ErrorFields>([]);

	const handleSubmit = (formData: RecipeToAddOrEdit) => {
		setLoading(true);

		updateRecipe(recipeToEdit.id, formData)
			.then(res => {
				if (res?.success) {
					navigate(`/recipe/${recipeToEdit.id}?edited=true`)
				}
				setErrorMessage(res?.msg);
			})
			.catch(error => {
				if (!(error instanceof AxiosError)) return;

				setErrorFields(error?.response?.data?.errors ?? []);
				setErrorMessage(error?.response?.data?.msg ?? 'Server error');
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return <Card>
		<CardContent>
			<Typography variant="h6" fontFamily="MonoSpace">Edit recipe</Typography>
			{errorMessage && <Box my={1}>
             <Alert severity="error">{errorMessage}</Alert>
         </Box>}

			<RecipeForm
				initialValues={{
					title: recipeToEdit.title,
					cookingTimeMinutes: recipeToEdit.cookingTimeMinutes,
					description: recipeToEdit.description,
					isPublic: recipeToEdit.isPublic,
					location: recipeToEdit.location,
					categories: recipeToEdit.categories.map(cat => cat.name),
					ingredients: recipeToEdit.ingredients.map(ing => ing.name),
				}}
				handleSubmit={handleSubmit}
				errorFields={errorFields}
				disableForm={loading}
			/>
		</CardContent>
	</Card>;
};

export default EditRecipe;
