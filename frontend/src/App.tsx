import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import PrivateRoute from '@/components/routing/PrivateRoute.tsx';

import Login from '@/pages/Login';
import NotFound from '@/pages/errors/NotFound.tsx';
import DrawerView from '@/pages/DrawerView.tsx';
import RecipeWall from '@/pages/RecipeWall.tsx';
import RecipeCard from '@/pages/RecipeCard.tsx';
import CreateRecipe from '@/pages/CreateRecipe.tsx';
import UserRecipes from '@/pages/UserRecipes.tsx';

const App = () => {
	return <Router>
		<Routes>
			<Route path="/" element={<PrivateRoute/>}>
				<Route path="recipe">
					<Route path="" element={
						<DrawerView>
							<CreateRecipe/>
						</DrawerView>
					}/>

					<Route path=":id" element={
						<DrawerView>
							<RecipeCard/>
						</DrawerView>
					}/>

					<Route path="user">
						<Route path=":id" element={
							<DrawerView>
								<UserRecipes/>
							</DrawerView>
						}/>
					</Route>
				</Route>

				<Route path="" element={
					<DrawerView>
						<RecipeWall/>
					</DrawerView>
				}/>
			</Route>
			<Route path="/login" element={<Login/>}/>
			<Route path="*" element={<NotFound/>}/>
		</Routes>
	</Router>;
}

export default App;
