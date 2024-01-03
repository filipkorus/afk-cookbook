import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListIcon from '@mui/icons-material/List';
import SidebarMenuItem from '@/components/sidebar/menu/SidebarMenuItem';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { useAuth } from '@/context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import {
	Avatar,
	Button,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Typography,
	Box,
} from '@mui/material';
import formatDate from '@/utils/date/formatDate.ts';

interface SidebarMenuProps {
	isSidebarOpen: boolean;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isSidebarOpen }) => {
	const { currentUser, handleLogout } = useAuth();
	const navigate = useNavigate();

	if (currentUser == null) return <></>;

	return (
		<Box display="flex" flexDirection="column" height="100%">
			<ListItem alignItems="flex-start">
				<ListItemAvatar>
					<Avatar alt={currentUser.name} src={currentUser.picture} />
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
				text={isSidebarOpen ? 'Create Recipe' : ''}
				title="Create Recipe"
				icon={<PostAddIcon sx={{ fontSize: '1.5rem' }} />}
			/>

			<SidebarMenuItem
				linkTo={`/recipe/user/${currentUser.id}`}
				text={isSidebarOpen ? 'My recipes' : ''}
				title="My recipes"
				icon={<ListIcon sx={{ fontSize: '1.5rem' }} />}
			/>

			<SidebarMenuItem
				linkTo="/"
				text={isSidebarOpen ? 'Wall' : ''}
				title="Wall"
				icon={<DashboardIcon sx={{ fontSize: '1.5rem' }} />}
			/>

			<Box sx={{ mt: 'auto' }}>
				<Button
					fullWidth
					style={{
						display: 'flex',
						alignItems: isSidebarOpen ? 'flex-start' : 'center',
						justifyContent: 'center',
						maxWidth: '95%',
						margin: '0 auto',
						textTransform: 'none',
						fontSize: isSidebarOpen ? 'inherit' : '1rem',
					}}
					variant="outlined"
					onClick={() =>
						handleLogout().then(({ success, error }) => {
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
						<LogoutIcon sx={{ fontSize: '1.5rem', marginLeft: isSidebarOpen ? '5px' : '0' }} />
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
