import React from 'react';
import Recipe from '@/types/Recipe.ts';
import {Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, IconButton, Typography} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import User from '@/types/User.ts';
import RouterLink from '@/components/routing/RouterLink.tsx';
import {Navigate, useLocation} from 'react-router-dom';
import timeSince from '@/utils/date/timeSince.ts';

export type RecipeWithAuthor = Recipe & { author: User };

type RecipeWallCardProps = { recipe: RecipeWithAuthor };

const RecipeWallCard: React.FC<RecipeWallCardProps> = ({recipe}) => {
	const location = useLocation();
	const query = new URLSearchParams(location.search);

	const from = query.get('from');
	if (from != null) {
		return <Navigate to={from} />;
	}

	return <Box m={2}>
		<Card>
			<CardHeader
				avatar={<Avatar aria-label="User" alt={recipe.author.name} src={recipe.author.picture}/>}
				title={`${recipe.author.name} | ${timeSince(recipe.createdAt)} ago`}
				subheader={recipe.location ?? ''}
			/>
			<CardContent>
				<Typography variant="h5" mb={2}>
					{recipe.title}
				</Typography>
				<Typography variant="body1" color="textPrimary" component="p">
					{recipe.description.slice(0, 100)}{recipe.description.length > 100 && <>...</>}
				</Typography>
				<Box my={2}>
					<RouterLink to={`/recipe/${recipe.id}`}>
						<Button variant="outlined" size="small" fullWidth>See full recipe</Button>
					</RouterLink>
				</Box>
			</CardContent>
			<CardActions disableSpacing>
				<IconButton aria-label="Like" title="Like">
					<ThumbUpIcon/>
				</IconButton>
				<IconButton aria-label="Dislike" title="Dislike">
					<ThumbDownIcon/>
				</IconButton>
			</CardActions>
		</Card>
	</Box>;
};

export default RecipeWallCard;
