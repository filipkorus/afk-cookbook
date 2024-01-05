import React from 'react';
import {Grid, Rating, Typography} from '@mui/material';
import Stars from '@/types/Stars';

type ReviewStarsProps = {
	stars: Stars | null;
};

const ReviewStars: React.FC<ReviewStarsProps> = ({stars}) => {
	return <Grid container>
		{stars && <>
          <Grid item>
              <Typography color="gray" p={1} mx={1} textAlign="right"
                          title="average score">{stars.average.toFixed(2)}</Typography>
          </Grid>
          <Grid mx={1} pt={.8} title={stars.average.toFixed(2)}>
              <Rating defaultValue={0.0} value={stars.average} precision={0.25} readOnly/>
          </Grid>
          <Grid>
              <Typography color="gray" p={1} textAlign="left" title="review count">({stars.count})</Typography>
          </Grid>
      </>}
	</Grid>;
};

export default ReviewStars;
