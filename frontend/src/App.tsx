import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import PrivateRoute from '@/components/routing/PrivateRoute';

import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/errors/NotFound';
import DrawerView from '@/pages/DrawerView';
import RecipeWallPage from '@/pages/RecipeWallPage';
import CreateRecipePage from '@/pages/CreateRecipePage';
import RecipesOfUserPage from '@/pages/RecipesOfUserPage';
import RecipePage from '@/pages/RecipePage';
import SearchPage from '@/pages/SearchPage';

const App = () => {
	return <Router>
		<Routes>
			<Route path="/" element={<PrivateRoute/>}>
				<Route path="recipe">
					<Route path="" element={
						<DrawerView pageTitle="Create recipe">
							<CreateRecipePage/>
						</DrawerView>
					}/>

					<Route path=":id" element={
						<DrawerView pageTitle="Recipe">
							<RecipePage/>
						</DrawerView>
					}/>

					<Route path="user">
						<Route path=":id" element={
							<DrawerView pageTitle="User profile">
								<RecipesOfUserPage/>
							</DrawerView>
						}/>
					</Route>
				</Route>

				<Route path="ingredient/:name" element={
					<DrawerView pageTitle="Ingredient wall">
						<RecipeWallPage wallType="ingredient"/>
					</DrawerView>
				}/>

				<Route path="ingredients/:commaSeparatedNames" element={
					<DrawerView>
						<RecipeWallPage wallType="ingredient"/>
					</DrawerView>
				}/>

				<Route path="category/:name" element={
					<DrawerView pageTitle="Category wall">
						<RecipeWallPage wallType="category"/>
					</DrawerView>
				}/>

				<Route path="categories/:commaSeparatedNames" element={
					<DrawerView>
						<RecipeWallPage wallType="category"/>
					</DrawerView>
				}/>

				<Route path="search" element={
					<DrawerView pageTitle="Search recipes">
						<SearchPage/>
					</DrawerView>
				}/>

				<Route path="" element={
					<DrawerView pageTitle="Recipe wall">
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
