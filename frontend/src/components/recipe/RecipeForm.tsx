import React, {useEffect, useRef, useState} from 'react';
import {Alert, Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, Grid, TextField} from '@mui/material';
import config from '@/config';
import theme from '@/theme';
import RecipeToAddOrEdit from '@/types/RecipeToAddOrEdit';
import useForm from '@/hooks/useForm';
import useItemList from '@/hooks/useItemList';
import ErrorFields from '@/types/ErrorFields';
import Action from '@/types/Action';
import {useNavigate} from 'react-router-dom';
import geocode from '@/api/geocode.ts';
import coords from '@/types/Coords.ts';

type RecipeFormProps = {
	initialValues?: RecipeToAddOrEdit,
	handleSubmit: (formData: RecipeToAddOrEdit) => any,
	disableForm: boolean,
	resetForm?: boolean,
	errorFields: ErrorFields,
	action: Action
};

const RecipeForm: React.FC<RecipeFormProps> = ({
	                                               initialValues,
	                                               handleSubmit,
	                                               disableForm,
	                                               errorFields,
	                                               resetForm,
	                                               action
                                               }) => {
	const navigate = useNavigate();
	const locateButtonRef = useRef<HTMLButtonElement | null>(null);

	const fieldError = (fieldName: keyof RecipeToAddOrEdit) => errorFields.find(error => error.path[0] === fieldName);

	const {
		formData,
		handleInputChange,
		resetForm: resetFormValues,
		setNewFormValues
	} = useForm<
		Omit<RecipeToAddOrEdit, 'ingredients' | 'categories'>
	>(initialValues ?? {
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
	} = useItemList(initialValues?.categories ?? [''], config.APP.RECIPE.CATEGORY.QUANTITY.MAX);

	const categoriesError = fieldError('categories');
	const renderCategoryInputs = () => {
		return categories.map((category, idx) => (
			<Grid container spacing={2} key={idx}>
				<Grid item xs={10}>
					<TextField
						label={`Category ${idx + 1}` + (category.trim().length > 0 ? ` (${category.trim().length}/${config.APP.RECIPE.CATEGORY.LENGTH.MAX})` : '')}
						value={category}
						onChange={(e) => {
							if (e.target.value.includes(',')) return;
							handleCategoryChange(idx, e.target.value)
						}}
						disabled={disableForm}
						inputProps={{
							minLength: config.APP.RECIPE.CATEGORY.LENGTH.MIN,
							maxLength: config.APP.RECIPE.CATEGORY.LENGTH.MAX
						}}
						error={
							(categoriesError?.code === 'too_small' &&
								category.trim().length < (categoriesError?.minimum ?? config.APP.RECIPE.CATEGORY.LENGTH.MIN))
							||
							(categoriesError?.code === 'too_big' &&
								category.length > (categoriesError?.maximum ?? config.APP.RECIPE.CATEGORY.LENGTH.MAX))
						}
						helperText={
							(categoriesError?.code === 'too_small' &&
								category.trim().length < (categoriesError?.minimum ?? config.APP.RECIPE.CATEGORY.LENGTH.MIN))
							||
							(categoriesError?.code === 'too_big' &&
								category.length > (categoriesError?.maximum ?? config.APP.RECIPE.CATEGORY.LENGTH.MAX))
								? categoriesError?.message : ''
						}
						required
						fullWidth
						sx={{mb: 2, mt: 1}}
					/>
				</Grid>
				{categories.length > 1 && <Grid item xs={2}>
                <Button
                    variant="outlined"
                    color="error"
                    disabled={disableForm}
                    onClick={() => removeCategoryInput(idx)}
                    sx={{mb: 2, mt: 1}}>
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
	} = useItemList(initialValues?.ingredients ?? [''], config.APP.RECIPE.INGREDIENT.QUANTITY.MAX);

	const ingredientsError = fieldError('ingredients');
	const renderIngredientInputs = () => {
		return ingredients.map((ingredient, idx) => (
			<Grid container spacing={2} key={idx}>
				<Grid item xs={10}>
					<TextField
						label={`Ingredient ${idx + 1}` + (ingredient.trim().length > 0 ? ` (${ingredient.trim().length}/${config.APP.RECIPE.INGREDIENT.LENGTH.MAX})` : '')}
						value={ingredient}
						onChange={(e) => {
							if (e.target.value.includes(',')) return;
							handleIngredientChange(idx, e.target.value)
						}}
						disabled={disableForm}
						inputProps={{
							minLength: config.APP.RECIPE.INGREDIENT.LENGTH.MIN,
							maxLength: config.APP.RECIPE.INGREDIENT.LENGTH.MAX
						}}
						error={
							(ingredientsError?.code === 'too_small' &&
								ingredient.trim().length < (ingredientsError?.minimum ?? config.APP.RECIPE.INGREDIENT.LENGTH.MIN))
							||
							(ingredientsError?.code === 'too_big' &&
								ingredient.length > (ingredientsError?.maximum ?? config.APP.RECIPE.INGREDIENT.LENGTH.MAX))
						}
						helperText={
							(ingredientsError?.code === 'too_small' &&
								ingredient.trim().length < (ingredientsError?.minimum ?? config.APP.RECIPE.INGREDIENT.LENGTH.MIN))
							||
							(ingredientsError?.code === 'too_big' &&
								ingredient.length > (ingredientsError?.maximum ?? config.APP.RECIPE.INGREDIENT.LENGTH.MAX))
								? ingredientsError?.message : ''
						}
						required
						fullWidth
						sx={{mb: 2, mt: 1}}
					/>
				</Grid>
				{ingredients.length > 1 && <Grid item xs={2}>
                <Button
                    variant="outlined"
                    color="error"
                    disabled={disableForm}
                    onClick={() => removeIngredientInput(idx)}
                    sx={{mb: 2, mt: 1}}>
                    Remove
                </Button>
            </Grid>}
			</Grid>
		));
	};

	useEffect(() => {
		if (!resetForm) return;

		resetFormValues();
		resetCategories();
		resetIngredients();
	}, [resetForm]);

	return <form onSubmit={
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			handleSubmit({
				...formData,
				categories,
				ingredients
			});
		}
	}>
		<FormGroup>
			<TextField
				variant="outlined"
				required
				label={"Title" + (formData.title.trim().length > 0 ? ` (${formData.title.trim().length}/${config.APP.RECIPE.TITLE.LENGTH.MAX})` : '')}
				name="title"
				error={fieldError('title') != null}
				helperText={fieldError('title')?.message}
				onChange={handleInputChange}
				disabled={disableForm}
				inputProps={{
					minLength: config.APP.RECIPE.TITLE.LENGTH.MIN,
					maxLength: config.APP.RECIPE.TITLE.LENGTH.MAX,
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
				disabled={disableForm}
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
				error={fieldError('description') != null || (formData.description.length > 0 && formData.description.length < config.APP.RECIPE.DESCRIPTION.LENGTH.MIN)}
				helperText={
					fieldError('description')?.message ??
					(formData.description.length > 0 && formData.description.length < config.APP.RECIPE.DESCRIPTION.LENGTH.MIN ?
						`description should be longer than ${config.APP.RECIPE.DESCRIPTION.LENGTH.MIN} characters` :
						'')
				}
				onChange={handleInputChange}
				disabled={disableForm}
				inputProps={{minLength: config.APP.RECIPE.DESCRIPTION.LENGTH.MIN}}
				value={formData.description}
				fullWidth
				sx={{my: 1}}
			/>

			<FormControlLabel disabled={disableForm} control={
				<Checkbox
					name="isPublic"
					onChange={handleInputChange}
					checked={formData.isPublic}
				/>
			} label="Make this recipe public" sx={{mb: 2, mt: 1}}/>

			<Box mb={2}>
				<TextField
					type="text"
					variant='outlined'
					label={"Location" + (formData.location?.trim().length ?? 0 > 0 ? ` (${formData.location?.trim().length}/${config.APP.RECIPE.LOCATION.LENGTH.MAX})` : '')}
					name="location"
					onChange={handleInputChange}
					value={formData.location}
					disabled={disableForm}
					inputProps={{maxLength: config.APP.RECIPE.LOCATION.LENGTH.MAX}}
					error={fieldError('location') != null}
					helperText={fieldError('location')?.message}
					fullWidth
					sx={{mb: 1}}
				/>

				<Button
					variant="outlined" type="button"
					ref={locateButtonRef}
					style={{color: theme.palette.primary.main, borderColor: theme.palette.primary.main}}
					onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
						if (locateButtonRef.current instanceof HTMLButtonElement) {
							locateButtonRef.current.disabled = true;
						}

						navigator.geolocation.getCurrentPosition(
							position => {
								geocode({
									lat: position.coords.latitude,
									lon: position.coords.longitude
								})
									.then(({success, error, data}) => {
										if (error) {
											return alert('Unable to retrieve location. Reason: Geocode API error. Try again in a few seconds.');
										}

										setNewFormValues({
											...formData,
											location: data?.location ?? data?.country ?? 'Somewhere in the Universe'
										});

										// hide button
										if (locateButtonRef.current instanceof HTMLButtonElement) {
											locateButtonRef.current.style.display = 'none';
										}
									});
							},
							err => alert(`Unable to retrieve location. Reason: ${err.message.toLowerCase()}.`)
						);

						if (locateButtonRef.current instanceof HTMLButtonElement) {
							locateButtonRef.current.disabled = false;
						}
					}}
					disabled={disableForm ?? locateButtonRef.current?.disabled} fullWidth>
					Use my current location
				</Button>
			</Box>

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
					        disabled={disableForm} onClick={addCategoryInput}>
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
					        disabled={disableForm}
					        onClick={addIngredientInput}>
						Add ingredient
					</Button>
				)}
			</Box>
		</FormGroup>

		<Button style={{color: theme.palette.primary.main, borderColor: theme.palette.primary.main}}
		        variant="outlined" type="submit"
		        disabled={disableForm} fullWidth>{action === 'edit' ? 'Save changes' : 'Submit'}</Button>

		{action === 'edit' && <Box my={1}>
          <Button
              variant="outlined" type="button"
              color="error"
              onClick={() => navigate(-1)}
              disabled={disableForm} fullWidth>
              Cancel
          </Button>
      </Box>}
	</form>;
};

export default RecipeForm;
