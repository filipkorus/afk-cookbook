import React from 'react';
import Recipe from '@/types/Recipe.ts';
import {Avatar, Box, Card, CardActions, CardContent, CardHeader, IconButton, Typography} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import User from '@/types/User.ts';
import formatDate from '@/utils/formatDate.ts';

export type RecipeWithAuthor = Recipe & { author: User };

type RecipeCardProps = { recipe: RecipeWithAuthor };

const RecipeCard: React.FC<RecipeCardProps> = ({recipe}) => {
	return <Box m={2}>
		<Card>
			<CardHeader
				avatar={<Avatar aria-label="User" alt={recipe.author.name} src={recipe.author.picture}/>}
				title={recipe.author.name}
				subheader={formatDate(recipe.createdAt)}
			/>
			<CardContent>
				<Typography variant="h5" mb={2}>
					{recipe.title}
				</Typography>
				<Typography variant="body1" color="textPrimary" component="p">
					{recipe.description}
				</Typography>
				{/* You can add media here using CardMedia component */}
				{/* Example: <CardMedia component="img" image="/path/to/image.jpg" alt="Post Image" /> */}
			</CardContent>
			<CardActions disableSpacing>
				<IconButton aria-label="Like">
					<ThumbUpIcon/>
				</IconButton>
				<IconButton aria-label="Dislike">
					<ThumbDownIcon/>
				</IconButton>
			</CardActions>
		</Card>
	</Box>;
};

export default RecipeCard;
