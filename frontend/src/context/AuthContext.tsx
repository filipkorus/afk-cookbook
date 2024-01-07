import React, {useContext, useState, useEffect, createContext, ReactNode} from 'react';
import api from '@/api';
import User from '@/types/User';
import {login, logout} from '@/api/auth';
import {getCurrentlyLoggedUser} from '@/api/user';
import {AxiosError} from 'axios';

type SuccessOrErrorMessage = {
	success: string | null;
	error: string | null;
}

type AuthContext = {
	currentUser: User | null,
	handleLogin: (credential: string) => Promise<SuccessOrErrorMessage>,
	handleLogout: () => Promise<SuccessOrErrorMessage>
};

const AuthContext = createContext<AuthContext | null>(null);

export const useAuth = (): AuthContext => {
	return useContext(AuthContext) as AuthContext;
}

export const AuthProvider = ({children}: { children: ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const handleLogin = async (credential: string): Promise<SuccessOrErrorMessage> => {
		try {
			const {data} = await login(credential);

			setCurrentUser(data?.user as User);
			api.defaults.headers.common['Authorization'] = `Bearer ${data?.token}`;
			setLoading(false);
			return {
				success: data?.msg || 'Logged in successfully',
				error: null
			};
		} catch (error) {
			setLoading(false);
			return {
				success: null,
				error: error instanceof AxiosError ?
					error?.response?.data?.msg :
					'Server connection error'
			};
		}
	};

	const handleLogout = async (): Promise<SuccessOrErrorMessage> => {
		try {
			const {status, data} = await logout();
			if (status === 200) {
				setCurrentUser(null);
				api.defaults.headers.common['Authorization'] = '';
				return {
					success: data?.msg as string ?? 'Logged out successfully',
					error: null
				};
			}
			return {
				success: null,
				error: data?.msg as string ?? 'Server error'
			};
		} catch (error) {
			return {
				success: null,
				error: error instanceof AxiosError ?
					error?.response?.data?.msg :
					'Server connection error'
			};
		}
	}

	useEffect(() => {
		if (currentUser != null) return;

		getCurrentlyLoggedUser()
			.then(res => {
				if (res.data?.user) {
					setCurrentUser(res.data?.user as User);
				}
			})
			.catch(error => {})
			.finally(() => setLoading(false));
	}, []);

	return <AuthContext.Provider value={{
		currentUser,
		handleLogin,
		handleLogout
	}}>
		{!loading && children}
	</AuthContext.Provider>;
}
