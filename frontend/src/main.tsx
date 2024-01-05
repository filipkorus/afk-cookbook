import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import CONFIG from '@/config';
import {ThemeProvider} from '@mui/material/styles';
import {GoogleOAuthProvider} from '@react-oauth/google';
import {SidebarProvider} from '@/context/SidebarContext.tsx';
import {CookbookProvider} from '@/context/CookbookContext.tsx';
import {AuthProvider} from '@/context/AuthContext.tsx';
import theme from '@/theme';
// import '@/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<GoogleOAuthProvider clientId={CONFIG.OAUTH_GOOGLE_CLIENT_ID}>
				<AuthProvider>
					<SidebarProvider>
						<CookbookProvider>
							<App/>
						</CookbookProvider>
					</SidebarProvider>
				</AuthProvider>
			</GoogleOAuthProvider>
		</ThemeProvider>
	</React.StrictMode>,
);
