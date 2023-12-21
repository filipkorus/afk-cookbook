import {AuthProvider} from '@/context/AuthContext';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {GoogleOAuthProvider} from '@react-oauth/google';
import CONFIG from '@/config';

import PrivateRoute from '@/components/routing/PrivateRoute.tsx';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import {CookbookProvider} from './context/CookbookContext';

const App = () => {
	return <Router>
		<GoogleOAuthProvider clientId={CONFIG.OAUTH_GOOGLE_CLIENT_ID}>
			<AuthProvider>
				<CookbookProvider>
					<Routes>
						<Route index path="/" element={<Navigate to="/login"/>}/>
						<Route path="/dashboard" element={<PrivateRoute/>}>
							<Route path="" element={<Dashboard/>}/>
						</Route>
						<Route path="/login" element={<Login/>}/>
						<Route path="*" element={<div>404 Not Found</div>}/>
					</Routes>
				</CookbookProvider>
			</AuthProvider>
		</GoogleOAuthProvider>
	</Router>;
}

export default App;
