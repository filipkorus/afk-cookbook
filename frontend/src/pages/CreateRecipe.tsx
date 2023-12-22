import React, {useState} from 'react';
import {
	Alert,
	Box,
	Button, Card, CardContent, Checkbox,
	Divider,
	FormControlLabel,
	FormGroup, Grid,
	TextField, Typography
} from '@mui/material';
import useForm from '@/hooks/useForm.ts';
import RecipeToAdd from '@/types/RecipeToAdd.ts';
import {z} from 'zod';
import {createRecipe} from '@/api/recipe.ts';
import {AxiosError} from 'axios';
import useItemList from '@/hooks/useItemList.ts';

const MAX_CATEGORIES_PER_RECIPE = 5;
const MAX_INGREDIENTS_PER_RECIPE = 25;

type CreateRecipeProps = {};

const CreateRecipe: React.FC<CreateRecipeProps> = ({}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [successMessage, setSuccessMessage] = useState<string>('');
	const [errorFields, setErrorFields] = useState<Array<z.ZodIssue>>([]);

	const isFieldError = (fieldName: keyof RecipeToAdd | 'category' | 'ingredients') => errorFields.findIndex(error => error.path[0] === fieldName) !== -1;
	const fieldErrorText = (fieldName: keyof RecipeToAdd | 'category' | 'ingredients') => errorFields.find(error => error.path[0] === fieldName)?.message ?? '';

	const {formData, handleInputChange, resetForm} = useForm<RecipeToAdd>({
		title: '',
		cookingTimeMinutes: 60,
		description: '',
		isPublic: false,
		location: ''
	});

	const {
		items: categories,
		handleItemChange: handleCategoryChange,
		addItem: addCategoryInput,
		removeItem: removeCategoryInput,
		resetList: resetCategories
	} = useItemList([''], MAX_CATEGORIES_PER_RECIPE);

	const renderCategoryInputs = () => {
		return categories.map((category, idx) => (
			<Grid container spacing={2} key={idx}>
				<Grid item xs={10}>
					<TextField
						label={`Category ${idx + 1}`}
						value={category}
						onChange={(e) => handleCategoryChange(idx, e.target.value)}
						disabled={loading}
						error={isFieldError('category')}
						fullWidth
						sx={{mb: 2, mt: idx === 0 ? 3 : 1}}
					/>
				</Grid>
				{categories.length > 1 && <Grid item xs={2}>
                <Button
                    variant="outlined"
                    color="error"
                    disabled={loading}
                    onClick={() => removeCategoryInput(idx)}
                    sx={{mb: 2, mt: idx === 0 ? 3 : 1}}>
                    Remove
                </Button>
            </Grid>}
			</Grid>
		));
	};

	const {
		items: ingredients,
		handleItemChange: handleIngredientChange,
		addItem: addIngredientInput,
		removeItem: removeIngredientInput,
		resetList: resetIngredients
	} = useItemList([''], MAX_INGREDIENTS_PER_RECIPE);

	const renderIngredientInputs = () => {
		return ingredients.map((ingredient, idx) => (
			<Grid container spacing={2} key={idx}>
				<Grid item xs={10}>
					<TextField
						label={`Ingredient ${idx + 1}`}
						value={ingredient}
						onChange={(e) => handleIngredientChange(idx, e.target.value)}
						disabled={loading}
						error={isFieldError('ingredients')}
						fullWidth
						sx={{mb: 2, mt: idx === 0 ? 3 : 1}}
					/>
				</Grid>
				{ingredients.length > 1 && <Grid item xs={2}>
                <Button
                    variant="outlined"
                    color="error"
                    disabled={loading}
                    onClick={() => removeIngredientInput(idx)}
                    sx={{mb: 2, mt: idx === 0 ? 3 : 1}}>
                    Remove
                </Button>
            </Grid>}
			</Grid>
		));
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setLoading(true);

		createRecipe({
			...formData, categories, ingredients
		})
			.then(res => {
				if (res?.success) {
					// reset all inputs to initial values
					resetForm();
					resetCategories();
					resetIngredients();

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
			<Typography variant="h6">New recipe</Typography>
			{successMessage && <Box  my={1}>
				 <Alert severity="success">{successMessage}</Alert>
			</Box>}
			<form onSubmit={handleSubmit}>
				<FormGroup>
					<TextField
						variant="outlined"
						required
						label="Title"
						name="title"
						error={isFieldError('title')}
						helperText={fieldErrorText('title')}
						onChange={handleInputChange}
						disabled={loading}
						value={formData.title}
						fullWidth
						sx={{mb: 2, mt: 1}}
					/>

					<TextField
						variant="outlined"
						required
						label="Time needed"
						name="cookingTimeMinutes"
						type="number"
						inputProps={{
							inputMode: 'numeric',
							pattern: '[0-9]*',
						}}
						error={isFieldError('cookingTimeMinutes')}
						helperText={fieldErrorText('cookingTimeMinutes')}
						onChange={handleInputChange}
						disabled={loading}
						value={formData.cookingTimeMinutes}
						fullWidth
						sx={{mb: 2, mt: 1}}
					/>

					<TextField
						variant="outlined"
						required
						label="Description"
						name="description"
						error={isFieldError('description')}
						helperText={fieldErrorText('description')}
						onChange={handleInputChange}
						disabled={loading}
						value={formData.description}
						fullWidth
						sx={{mb: 2, mt: 1}}
					/>

					<FormControlLabel disabled={loading} control={
						<Checkbox
							name="isPublic"
							onChange={handleInputChange}
							checked={formData.isPublic}
						/>
					} label="Make this recipe public" sx={{mb: 2, mt: 1}}/>

					<TextField
						type="text"
						variant='outlined'
						label="Location"
						name="location"
						onChange={handleInputChange}
						value={formData.location}
						disabled={loading}
						error={isFieldError('location')}
						helperText={fieldErrorText('location')}
						fullWidth
						sx={{mb: 4}}
					/>

					<Divider/>

					{fieldErrorText('category') && <Alert severity="error">{fieldErrorText('category')}</Alert>}
					{renderCategoryInputs()}
					<Box marginBottom={2}>
						{categories.length < MAX_CATEGORIES_PER_RECIPE && (
							<Button variant="contained" disabled={loading} onClick={addCategoryInput}>
								Add category
							</Button>
						)}
					</Box>

					<Divider/>

					{fieldErrorText('category') && <Alert severity="error">{fieldErrorText('category')}</Alert>}
					{renderIngredientInputs()}
					<Box marginBottom={2}>
						{ingredients.length < MAX_INGREDIENTS_PER_RECIPE && (
							<Button variant="contained" disabled={loading} onClick={addIngredientInput}>
								Add ingredient
							</Button>
						)}
					</Box>
				</FormGroup>

				<Button variant="outlined" type="submit" disabled={loading} fullWidth>Save</Button>
			</form>
		</CardContent>
	</Card>;
};

export default CreateRecipe;
