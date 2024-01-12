import React from 'react';
import {Grid, Skeleton, Typography} from '@mui/material';

const ReviewSkeletonComment: React.FC = () => {
	return <Grid container wrap="nowrap" spacing={2}>
		<Grid item>
			<Skeleton animation="wave" variant="circular" width={40} height={40}/>
		</Grid>
		<Grid justifyContent="left" item xs zeroMinWidth>
			<Typography m={0} textAlign="left" variant="subtitle2"
			            sx={{cursor: 'pointer'}}
			>
				<Skeleton />
			</Typography>

			<Skeleton variant="rectangular" width="100%" animation="wave">
				<div style={{ paddingTop: '17%' }} />
			</Skeleton>
		</Grid>
	</Grid>;
};

export default ReviewSkeletonComment;
