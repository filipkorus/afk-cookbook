// SidebarNavigation.tsx

import React from 'react';
import { List } from '@mui/material';
import SidebarMenu from '@/components/sidebar/menu/SidebarMenu.tsx';
import { useSidebar } from '@/context/SidebarContext.tsx';

const SidebarNavigation: React.FC = () => {
	const { isSidebarOpen } = useSidebar();

	return (
		<List component="nav">
			<SidebarMenu isSidebarOpen={isSidebarOpen} />
		</List>
	);
};

export default SidebarNavigation;
