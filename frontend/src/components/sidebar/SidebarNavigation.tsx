import React from 'react';
import { List } from '@mui/material';
import SidebarMenu from '@/components/sidebar/menu/SidebarMenu.tsx';

const SidebarNavigation: React.FC = () => {
	return (
		<List component="nav">
			<SidebarMenu />
		</List>
	);
};

export default SidebarNavigation;
