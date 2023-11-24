import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.tsx';

const PrivateRoute = () => {
	const { currentUser } = useAuth();

	return currentUser ? <Outlet /> : <Navigate to="/login?kickedOut=true" />;
}

export default PrivateRoute;
