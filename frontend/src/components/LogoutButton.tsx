import React from 'react';
import {Button, ButtonProps} from '@mui/material';
import {useAuth} from '@/context/AuthContext.tsx';
import {useNavigate} from 'react-router-dom';

type LogoutButtonProps = Omit<ButtonProps, 'onClick'> & {};

const LogoutButton: React.FC<LogoutButtonProps> = ({...rest}) => {
	const {handleLogout} = useAuth();
	const navigate = useNavigate();

	return <Button
		variant="contained"
		onClick={() => {
			handleLogout()
				.then(({success, error}) => {
					if (error) return alert(error);

					navigate('/login?loggedOut=true');
				})
		}}
		{...rest}
	>
		Log out
	</Button>;
};

export default LogoutButton;
