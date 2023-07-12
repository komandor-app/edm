import { usePermission } from '@rocket.chat/ui-contexts';
import { lazy, useEffect } from 'react';

import { registerAdminRoute, registerAdminSidebarItem, unregisterAdminSidebarItem } from '../../../../../client/views/admin';
import { useHasLicenseModule } from '../../../hooks/useHasLicenseModule';

declare module '@rocket.chat/ui-contexts' {
	interface IRouterPaths {
		'engagement-dashboard': {
			pattern: '/admin/engagement-dashboard/:tab?';
			pathname: `/admin/engagement-dashboard${`/${string}` | ''}`;
		};
	}
}

export const useEngagementDashboard = () => {
	const enabled = useHasLicenseModule('engagement-dashboard');
	const canView = usePermission('view-engagement-dashboard');

	const enabledForAdmin = enabled === true && canView;

	useEffect(() => {
		if (!enabledForAdmin) {
			return;
		}

		const [, unregisterAdminRoute] = registerAdminRoute('/engagement-dashboard/:tab?', {
			name: 'engagement-dashboard',
			component: lazy(() => import('../../admin/engagementDashboard/EngagementDashboardRoute')),
		});

		registerAdminSidebarItem({
			href: '/admin/engagement-dashboard',
			i18nLabel: 'Engagement Dashboard',
			icon: 'file-keynote',
		});

		return () => {
			unregisterAdminRoute();
			unregisterAdminSidebarItem('Engagement Dashboard');
		};
	}, [enabledForAdmin]);
};
