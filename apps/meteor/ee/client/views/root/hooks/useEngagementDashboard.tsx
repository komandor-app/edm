import { usePermission } from '@rocket.chat/ui-contexts';
import React, { lazy } from 'react';

import { useAdminRouteDefinition } from '../../../../../client/hooks/router/useAdminRouteDefinition';
import { useHasLicenseModule } from '../../../hooks/useHasLicenseModule';

declare module '@rocket.chat/ui-contexts' {
	interface IRouterPaths {
		'engagement-dashboard': {
			pattern: '/admin/engagement-dashboard/:tab?';
			pathname: `/admin/engagement-dashboard${`/${string}` | ''}`;
		};
	}
}

const EngagementDashboardRoute = lazy(() => import('../../admin/engagementDashboard/EngagementDashboardRoute'));

export const useEngagementDashboard = () => {
	const licensed = useHasLicenseModule('engagement-dashboard') === true;
	const permitted = usePermission('view-engagement-dashboard');

	useAdminRouteDefinition({
		enabled: licensed && permitted,
		id: 'engagement-dashboard',
		path: '/admin/engagement-dashboard/:tab?',
		sidebar: {
			id: 'Engagement Dashboard',
			href: '/admin/engagement-dashboard',
			icon: 'file-keynote',
		},
		element: <EngagementDashboardRoute />,
	});
};
