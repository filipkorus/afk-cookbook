import {Navigate, Outlet, useLocation, useNavigate} from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.tsx';

const PrivateRoute = () => {
	const { currentUser } = useAuth();

	const location = useLocation();
	const query = new URLSearchParams(location.search);

	// ?kickedOut=true
	return currentUser ? <Outlet /> : <Navigate to={`/login?${query.toString()}`} />;
}

export default PrivateRoute;
