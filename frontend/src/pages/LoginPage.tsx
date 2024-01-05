import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Alert, Box, Container, Grid, LinearProgress, Snackbar} from '@mui/material';
import {CredentialResponse, GoogleLogin} from '@react-oauth/google';
import logo from '@/assets/logo.png';
import {useAuth} from '@/context/AuthContext.tsx';
import '@/styles/pages.css';

const LoginPage = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	const {handleLogin, currentUser} = useAuth();

	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const navigate = useNavigate();

	const params = new URLSearchParams(window.location.search);
	const [isLoggedOut, setIsLoggedOut] = useState<boolean>(params.get('loggedOut') === 'true');
	const [isKickedOut, setIsKickedOut] = useState<boolean>(params.get('kickedOut') === 'true');

	// redirect authorized user from Login page
	useEffect(() => {
		if (currentUser == null) return;

		navigate(`/?${query.toString()}`);
	}, [currentUser]);

	const responseMessage = async (response: CredentialResponse) => {
		setError('');
		setIsLoggedOut(false);
		setIsKickedOut(false);
		setLoading(true);

		const {success, error} = await handleLogin(response.credential ?? '');

		// redirect authorized user to Dashboard page
		if (success) {
			return navigate('/');
		}

		setError(error ?? '');
		setLoading(false);
	};

	const errorMessage = () => {
		setError('OAuth error');
		setLoading(false);
	};

	return <>
		<Container maxWidth="xs" style={{ height: '95vh', overflow: 'hidden' }}>
			{loading && currentUser == null && (
				<LinearProgress color="secondary" sx={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />
			)}

			<Grid container direction="column" alignItems="center" justifyContent="center" height="100%">
				<div style={{ textAlign: 'center' }}>
					<img className="logo-animation" src={logo} alt="logo" style={{ width: '80%', maxWidth: '200px' }} />
					<p style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '24px', color: '#960f5a' }}>
						----------CookBook----------
					</p>
				</div>
				<Box marginTop="2rem">
					{!loading && currentUser == null && <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />}
				</Box>

				{error && currentUser == null && (
					<Box marginTop="2rem">
						<Alert severity="error">{error}</Alert>
					</Box>
				)}
			</Grid>

			{currentUser == null && (
				<>
					<Snackbar open={isLoggedOut}>
						<Alert severity="success" onClose={() => setIsLoggedOut(false)}>
							Logged out successfully
						</Alert>
					</Snackbar>
					<Snackbar open={isKickedOut}>
						<Alert severity="warning" onClose={() => setIsKickedOut(false)}>
							Please log in
						</Alert>
					</Snackbar>
				</>
			)}
		</Container>

		{currentUser == null && <>
          <Snackbar open={isLoggedOut}>
              <Alert severity="success" onClose={() => setIsLoggedOut(false)}>Logged out successfully</Alert>
          </Snackbar>
          <Snackbar open={isKickedOut}>
              <Alert severity="warning" onClose={() => setIsKickedOut(false)}>Please log in</Alert>
          </Snackbar>
      </>}
	</>
};

export default LoginPage;
