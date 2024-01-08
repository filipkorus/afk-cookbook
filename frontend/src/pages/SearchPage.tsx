import React, {useState} from 'react';
import {
	Box, Button, Card,
	CardContent,
	FormControl,
	FormControlLabel,
	FormGroup, FormLabel, Radio, RadioGroup,
	TextField, Grid
} from '@mui/material';
import config from '@/config';
import theme from '@/theme';
import useItemList from '@/hooks/useItemList';
import {useNavigate} from 'react-router-dom';

type SearchPageProps = {};

const SearchPage: React.FC<SearchPageProps> = ({}) => {
	const navigate = useNavigate();
	const [searchBy, setSearchBy] = useState<'ingredients' | 'categories'>('ingredients');

	const {
		items: categories,
		handleItemChange: handleCategoryChange,
		addItem: addCategoryInput,
		removeItem: removeCategoryInput
	} = useItemList([''], config.APP.RECIPE.CATEGORY.QUANTITY.MAX);

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
						inputProps={{
							minLength: config.APP.RECIPE.CATEGORY.LENGTH.MIN,
							maxLength: config.APP.RECIPE.CATEGORY.LENGTH.MAX
						}}
						required={searchBy === 'categories'}
						fullWidth
						sx={{mb: 2, mt: idx === 0 ? 3 : 1}}
					/>
				</Grid>
				{categories.length > 1 && <Grid item xs={2}>
                <Button
                    variant="outlined"
                    color="error"
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
		removeItem: removeIngredientInput
	} = useItemList([''], config.APP.RECIPE.INGREDIENT.QUANTITY.MAX);

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
						inputProps={{
							minLength: config.APP.RECIPE.INGREDIENT.LENGTH.MIN,
							maxLength: config.APP.RECIPE.INGREDIENT.LENGTH.MAX
						}}
						required={searchBy === 'ingredients'}
						fullWidth
						sx={{mb: 2, mt: idx === 0 ? 3 : 1}}
					/>
				</Grid>
				{ingredients.length > 1 && <Grid item xs={2}>
                <Button
                    variant="outlined"
                    color="error"
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

		const names = (searchBy === 'ingredients' ? ingredients : categories)
			.filter(item => item != null)
			.map(item => item.trim())
			.filter(item => item.length > 0)
			.join(',');

		const urlParam = encodeURIComponent(names);

		if (names.length === 1) {
			navigate(`/${searchBy === 'categories' ? 'category' : 'ingredient'}/${urlParam}`);

			return;
		}

		navigate(`/${searchBy}/${urlParam}`);
	};

	return <Card>
		<CardContent>
			<form onSubmit={handleSubmit}>
				<FormGroup>
					<FormControl>
						<FormLabel style={{color: theme.palette.primary.main}}>Search by</FormLabel>
						<RadioGroup
							value={searchBy}
							onChange={e => setSearchBy(
								e.target.value === 'ingredients' ? 'ingredients' : 'categories'
							)}
						>
							<FormControlLabel value="ingredients"
							                  control={<Radio style={{color: theme.palette.primary.main}}/>}
							                  label="Ingredients"/>
							<FormControlLabel value="categories" control={<Radio style={{color: theme.palette.primary.main}}/>}
							                  label="Categories"/>
						</RadioGroup>
					</FormControl>

					<Box my={2}>
						{searchBy === 'ingredients' ?
							<>
								{renderIngredientInputs()}

								{ingredients.length < config.APP.RECIPE.INGREDIENT.QUANTITY.MAX && (
									<Button style={{backgroundColor: theme.palette.primary.main}} variant="contained"
									        onClick={addIngredientInput}>
										Add ingredient
									</Button>
								)}
							</> :
							<>
								{renderCategoryInputs()}

								{categories.length < config.APP.RECIPE.CATEGORY.QUANTITY.MAX && (
									<Button style={{backgroundColor: theme.palette.primary.main}} variant="contained"
									        onClick={addCategoryInput}>
										Add category
									</Button>
								)}
							</>
						}
					</Box>
				</FormGroup>

				<Button style={{color: theme.palette.primary.main, borderColor: theme.palette.primary.main}}
				        variant="outlined" type="submit"
				        fullWidth>
					Search
				</Button>
			</form>
		</CardContent>
	</Card>;
};

export default SearchPage;
