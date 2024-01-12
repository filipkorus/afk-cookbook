import React from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	Typography, Grid, Skeleton
} from '@mui/material';

const RecipeSkeletonCard: React.FC = () => {
	return <Card>
		<CardHeader
			avatar={<Skeleton animation="wave" variant="circular" width={40} height={40}/>}
			title={<Skeleton />}
		/>
		<CardContent sx={{padding: '0 1.4rem 0 1.4rem'}}>
			<Grid container>
				<Grid item xs={12} md={9}>
					<Typography fontSize="1.65rem" fontFamily="Monospace">
						<Skeleton animation="wave" />
					</Typography>
				</Grid>

				<Skeleton variant="rectangular" width="100%" animation="wave">
					<div style={{ paddingTop: '37%' }} />
				</Skeleton>
			</Grid>
		</CardContent>
	</Card>;
};

export default RecipeSkeletonCard;
