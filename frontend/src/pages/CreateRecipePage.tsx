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
import config from '@/config';
import theme from '@/theme';

const CreateRecipePage: React.FC = ({}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [successMessage, setSuccessMessage] = useState<string>('');
	const [errorFields, setErrorFields] = useState<Array<z.ZodIssue & { minimum?: number, maximum?: number }>>([]);

	const fieldError = (fieldName: keyof RecipeToAdd | 'categories' | 'ingredients') => errorFields.find(error => error.path[0] === fieldName);

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
	} = useItemList([''], config.APP.RECIPE.CATEGORY.QUANTITY.MAX);

	const categoriesError = fieldError('categories');
	const renderCategoryInputs = () => {
		return categories.map((category, idx) => (
			<Grid container spacing={2} key={idx}>
				<Grid item xs={10}>
					<TextField
						label={`Category ${idx + 1}` + (category.length > 0 ? ` (${category.length}/${config.APP.RECIPE.CATEGORY.LENGTH.MAX})` : '')}
						value={category}
						onChange={(e) => handleCategoryChange(idx, e.target.value)}
						disabled={loading}
						inputProps={{
							minLength: config.APP.RECIPE.CATEGORY.LENGTH.MIN,
							maxLength: config.APP.RECIPE.CATEGORY.LENGTH.MAX
						}}
						error={
							(categoriesError?.code === 'too_small' &&
								category.length < (categoriesError?.minimum ?? config.APP.RECIPE.CATEGORY.LENGTH.MIN))
							||
							(categoriesError?.code === 'too_big' &&
								category.length > (categoriesError?.maximum ?? config.APP.RECIPE.CATEGORY.LENGTH.MAX))
						}
						helperText={
							(categoriesError?.code === 'too_small' &&
								category.length < (categoriesError?.minimum ?? config.APP.RECIPE.CATEGORY.LENGTH.MIN))
							||
							(categoriesError?.code === 'too_big' &&
								category.length > (categoriesError?.maximum ?? config.APP.RECIPE.CATEGORY.LENGTH.MAX))
								? categoriesError?.message : ''
						}
						required
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
	} = useItemList([''], config.APP.RECIPE.INGREDIENT.QUANTITY.MAX);

	const ingredientsError = fieldError('ingredients');
	const renderIngredientInputs = () => {
		return ingredients.map((ingredient, idx) => (
			<Grid container spacing={2} key={idx}>
				<Grid item xs={10}>
					<TextField
						label={`Ingredient ${idx + 1}` + (ingredient.length > 0 ? ` (${ingredient.length}/${config.APP.RECIPE.INGREDIENT.LENGTH.MAX})` : '')}
						value={ingredient}
						onChange={(e) => handleIngredientChange(idx, e.target.value)}
						disabled={loading}
						inputProps={{
							minLength: config.APP.RECIPE.INGREDIENT.LENGTH.MIN,
							maxLength: config.APP.RECIPE.INGREDIENT.LENGTH.MAX
						}}
						error={
							(ingredientsError?.code === 'too_small' &&
								ingredient.length < (ingredientsError?.minimum ?? config.APP.RECIPE.INGREDIENT.LENGTH.MIN))
							||
							(ingredientsError?.code === 'too_big' &&
								ingredient.length > (ingredientsError?.maximum ?? config.APP.RECIPE.INGREDIENT.LENGTH.MAX))
						}
						helperText={
							(ingredientsError?.code === 'too_small' &&
								ingredient.length < (ingredientsError?.minimum ?? config.APP.RECIPE.INGREDIENT.LENGTH.MIN))
							||
							(ingredientsError?.code === 'too_big' &&
								ingredient.length > (ingredientsError?.maximum ?? config.APP.RECIPE.INGREDIENT.LENGTH.MAX))
								? ingredientsError?.message : ''
						}
						required
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
			<Typography variant="h6" fontFamily="MonoSpace">New recipe</Typography>
			{successMessage && <Box my={1}>
             <Alert severity="success">{successMessage}</Alert>
         </Box>}
			<form onSubmit={handleSubmit}>
				<FormGroup>
					<TextField
						variant="outlined"
						required
						label={"Title" + (formData.title.length > 0 ? ` (${formData.title.length}/${config.APP.RECIPE.TITLE.LENGTH.MAX})` : '')}
						name="title"
						error={fieldError('title') != null}
						helperText={fieldError('title')?.message}
						onChange={handleInputChange}
						disabled={loading}
						inputProps={{
							minLength: config.APP.RECIPE.TITLE.LENGTH.MIN,
							maxLength: config.APP.RECIPE.TITLE.LENGTH.MAX
						}}
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
						error={fieldError('cookingTimeMinutes') != null}
						helperText={fieldError('cookingTimeMinutes')?.message}
						onChange={handleInputChange}
						disabled={loading}
						value={formData.cookingTimeMinutes}
						fullWidth
						sx={{mb: 2, mt: 1}}
					/>

					<TextField
						multiline
						maxRows={10}
						variant="outlined"
						required
						label="Description"
						name="description"
						error={fieldError('description') != null}
						helperText={fieldError('description')?.message}
						onChange={handleInputChange}
						disabled={loading}
						inputProps={{minLength: config.APP.RECIPE.DESCRIPTION.LENGTH.MIN}}
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
						label={"Location" + (formData.location?.length ?? 0 > 0 ? ` (${formData.location?.length}/${config.APP.RECIPE.LOCATION.LENGTH.MAX})` : '')}
						name="location"
						onChange={handleInputChange}
						value={formData.location}
						disabled={loading}
						inputProps={{maxLength: config.APP.RECIPE.LOCATION.LENGTH.MAX}}
						error={fieldError('location') != null}
						helperText={fieldError('location')?.message}
						fullWidth
						sx={{mb: 4}}
					/>

					<Divider/>

					<Box my={2}>
						{
							!categoriesError?.code.startsWith('too_') &&
							categoriesError != null &&
                      <Alert severity="error">{categoriesError?.message}</Alert>
						}

						{renderCategoryInputs()}

						{categories.length < config.APP.RECIPE.CATEGORY.QUANTITY.MAX && (
							<Button style={{backgroundColor: theme.palette.primary.main}} variant="contained"
							        disabled={loading} onClick={addCategoryInput}>
								Add category
							</Button>
						)}
					</Box>

					<Divider/>

					<Box my={2}>
						{
							!ingredientsError?.code.startsWith('too_') &&
							ingredientsError != null &&
                      <Alert severity="error">{ingredientsError?.message}</Alert>
						}

						{renderIngredientInputs()}

						{ingredients.length < config.APP.RECIPE.INGREDIENT.QUANTITY.MAX && (
							<Button style={{backgroundColor: theme.palette.primary.main}} variant="contained"
							        disabled={loading}
							        onClick={addIngredientInput}>
								Add ingredient
							</Button>
						)}
					</Box>
				</FormGroup>

				<Button style={{color: theme.palette.primary.main, borderColor: theme.palette.primary.main}}
				        variant="outlined" type="submit"
				        disabled={loading} fullWidth>Save</Button>
			</form>
		</CardContent>
	</Card>;
};

export default CreateRecipePage;
