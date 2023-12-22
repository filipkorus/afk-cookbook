import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SidebarMenuItem from '@/components/sidebar/menu/SidebarMenuItem';
import {useAuth} from '@/context/AuthContext.tsx';
import {useNavigate} from 'react-router-dom';
import {
	Avatar,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Typography
} from '@mui/material';
import formatDate from '@/utils/formatDate.ts';

const SidebarMenu: React.FC = () => {
	const {currentUser, handleLogout} = useAuth();
	const navigate = useNavigate();

	if (currentUser == null) return <></>;

	return <>
		<ListItem alignItems="flex-start">
			<ListItemAvatar>
				<Avatar alt={currentUser.name} src={currentUser.picture}/>
			</ListItemAvatar>
			<ListItemText
				primary={currentUser.name}
				secondary={
					<Typography
						sx={{display: 'inline'}}
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
			linkTo="/"
			text="Wall"
			title="Wall"
			icon={<DashboardIcon/>}
		/>

		<SidebarMenuItem
			text="Logout"
			title="Logout"
			icon={<LogoutIcon/>}
			onClick={() => handleLogout()
				.then(({success, error}) => {
					if (error) return alert(error);

					navigate('/login?loggedOut=true');
				})
			}
		/>
	</>;
};

export default SidebarMenu;
