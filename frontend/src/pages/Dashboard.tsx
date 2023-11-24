import React from 'react';
import {Avatar, Box} from '@mui/material';
import {useAuth} from '@/context/AuthContext.tsx';
import LogoutButton from '@/components/LogoutButton.tsx';

const Dashboard: React.FC = () => {
	const {currentUser} = useAuth();

	if (currentUser == null) return <></>;

	return <>
		<Box>
			<pre>
				{JSON.stringify(currentUser, null, 3)}
			</pre>
		</Box>

		<Box m={1}>
			<Avatar src={currentUser.picture}></Avatar>
		</Box>

		<LogoutButton />
	</>;
};

export default Dashboard;
