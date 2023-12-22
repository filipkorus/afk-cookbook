import {AuthProvider} from '@/context/AuthContext';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {GoogleOAuthProvider} from '@react-oauth/google';
import CONFIG from '@/config';

import PrivateRoute from '@/components/routing/PrivateRoute.tsx';

import Login from '@/pages/Login';
import {CookbookProvider} from './context/CookbookContext';
import NotFound from '@/pages/errors/NotFound.tsx';
import DrawerView from '@/pages/DrawerView.tsx';
import {SidebarProvider} from '@/context/SidebarContext.tsx';
import RecipeWall from '@/pages/RecipeWall.tsx';

const App = () => {
	return <Router>
		<GoogleOAuthProvider clientId={CONFIG.OAUTH_GOOGLE_CLIENT_ID}>
			<AuthProvider>
				<SidebarProvider>
					<CookbookProvider>
						<Routes>
							<Route path="/" element={<PrivateRoute/>}>
								<Route path="" element={
									<DrawerView>
										<RecipeWall/>
									</DrawerView>
								}/>
							</Route>
							<Route path="/login" element={<Login/>}/>
							<Route path="*" element={<NotFound/>}/>
						</Routes>
					</CookbookProvider>
				</SidebarProvider>
			</AuthProvider>
		</GoogleOAuthProvider>
	</Router>;
}

export default App;
