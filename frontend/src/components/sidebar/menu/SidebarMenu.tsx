import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
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

const SidebarMenu: React.FC = () => {
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
							sx={{ display: 'inline' }}
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
				icon={<PostAddIcon />}
			/>

			<SidebarMenuItem linkTo="/" text="Wall" title="Wall" icon={<DashboardIcon />} />

			<Box sx={{ mt: 'auto' }}>
				{/* mt: 'auto' dla marginesu na dole */}
				<Button
					fullWidth
					style={{maxWidth:'95%',marginLeft:'2%'}}

					variant="outlined"
					startIcon={<LogoutIcon />}
					onClick={() =>
						handleLogout().then(({ success, error }) => {
							if (error) return alert(error);
							navigate('/login?loggedOut=true');
						})
					}
				>
					Log out
				</Button>
			</Box>
		</Box>
	);
};

export default SidebarMenu;
