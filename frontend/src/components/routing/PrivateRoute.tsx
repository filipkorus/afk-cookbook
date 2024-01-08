import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';

const PrivateRoute = () => {
	const {currentUser} = useAuth();

	const location = useLocation();
	const query = new URLSearchParams(location.search);

	query.set('from', location.pathname); // we can redirect user back when he is authenticated again

	// ?kickedOut=true
	return currentUser ? <Outlet/> : <Navigate to={`/login?${query.toString()}`}/>;
}

export default PrivateRoute;
