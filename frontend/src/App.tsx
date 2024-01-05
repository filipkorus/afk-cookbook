import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import PrivateRoute from '@/components/routing/PrivateRoute.tsx';

import LoginPage from '@/pages/LoginPage.tsx';
import NotFound from '@/pages/errors/NotFound.tsx';
import DrawerView from '@/pages/DrawerView.tsx';
import RecipeWallPage from '@/pages/RecipeWallPage.tsx';
import CreateRecipePage from '@/pages/CreateRecipePage.tsx';
import RecipesOfUserPage from '@/pages/RecipesOfUserPage.tsx';
import RecipePage from './pages/RecipePage';

const App = () => {
	return <Router>
		<Routes>
			<Route path="/" element={<PrivateRoute/>}>
				<Route path="recipe">
					<Route path="" element={
						<DrawerView>
							<CreateRecipePage/>
						</DrawerView>
					}/>

					<Route path=":id" element={
						<DrawerView>
							<RecipePage/>
						</DrawerView>
					}/>

					<Route path="user">
						<Route path=":id" element={
							<DrawerView>
								<RecipesOfUserPage/>
							</DrawerView>
						}/>
					</Route>
				</Route>

				<Route path="" element={
					<DrawerView>
						<RecipeWallPage/>
					</DrawerView>
				}/>
			</Route>
			<Route path="/login" element={<LoginPage/>}/>
			<Route path="*" element={<NotFound/>}/>
		</Routes>
	</Router>;
}

export default App;
