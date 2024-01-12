import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListIcon from '@mui/icons-material/List';
import CategoryIcon from '@mui/icons-material/Category';
import SidebarMenuItem from '@/components/sidebar/menu/SidebarMenuItem';
import PostAddIcon from '@mui/icons-material/PostAdd';
import {useAuth} from '@/context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {
	Avatar,
	Button,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Typography,
	Box,
} from '@mui/material';
import formatDate from '@/utils/date/formatDate';
import {useSidebar} from '@/context/SidebarContext';
import theme from '@/theme';

const SidebarMenu: React.FC = () => {
	const {currentUser, handleLogout} = useAuth();
	const navigate = useNavigate();
	const {isSidebarOpen} = useSidebar();

	if (currentUser == null) return <></>;

	return (
		<Box display="flex" flexDirection="column" height="100%">
			<ListItem alignItems="flex-start">
				<ListItemAvatar>
					<Avatar alt={currentUser.name} src={currentUser.picture}/>
				</ListItemAvatar>
				<ListItemText
					primary={currentUser.name}
					secondary={
						<Typography
							sx={{
								display: 'inline',
								textAlign: isSidebarOpen ? 'left' : 'center',
							}}
							component="span"
							variant="body2"
							color="text.primary"
						>
							since {formatDate(currentUser.joinedAt)}
						</Typography>
					}
				/>
			</ListItem>

			<SidebarMenuItem
				linkTo="/recipe"
				text="Create Recipe"
				title="Create Recipe"
				icon={<PostAddIcon/>}
			/>

			<SidebarMenuItem
				linkTo={`/recipe/user/${currentUser.id}`}
				text="My recipes"
				title="My recipes"
				icon={<ListIcon/>}
			/>

			<SidebarMenuItem
				linkTo="/search/"
				text="Search recipes"
				title="Search recipes"
				icon={<CategoryIcon/>}
			/>

			<SidebarMenuItem
				linkTo="/"
				text="Wall"
				title="Wall"
				icon={<DashboardIcon/>}
			/>

			<Box mt={1}>
				<Button
					fullWidth
					style={{
						display: 'flex',
						color: theme.palette.primary.main,
						borderColor: theme.palette.primary.main,
						maxWidth: '95%',
						margin: '0 auto',
						textTransform: 'none',
					}}
					title="Log out"
					variant="outlined"
					onClick={() =>
						handleLogout()
							.then(({success, error}) => {
								if (error) return alert(error);
								navigate('/login?loggedOut=true');
							})
					}
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<LogoutIcon sx={{marginLeft: isSidebarOpen ? '5px' : '0'}}/>
						{isSidebarOpen && (
							<Typography
								sx={{
									display: 'inline',
									marginLeft: '5px',
								}}
							>
								Log out
							</Typography>
						)}
					</Box>
				</Button>
			</Box>
		</Box>
	);
};

export default SidebarMenu;
