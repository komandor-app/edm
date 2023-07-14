import { usePermission } from '@rocket.chat/ui-contexts';
import React, { lazy } from 'react';

import { useAccountRouteDefinition } from '../../../../../client/hooks/router/useAccountRouteDefinition';
import { useAdminRouteDefinition } from '../../../../../client/hooks/router/useAdminRouteDefinition';
import { useHasLicenseModule } from '../../../hooks/useHasLicenseModule';

const DeviceManagementAdminRoute = lazy(() => import('../../admin/deviceManagement/DeviceManagementAdminRoute'));
const DeviceManagementAccountPage = lazy(() => import('../../account/deviceManagement/DeviceManagementAccountPage'));

declare module '@rocket.chat/ui-contexts' {
	interface IRouterPaths {
		'device-management': {
			pathname: `/admin/device-management${`/${string}` | ''}${`/${string}` | ''}`;
			pattern: '/admin/device-management/:context?/:id?';
		};
		'manage-devices': {
			pathname: '/account/manage-devices';
			pattern: '/account/manage-devices';
		};
	}
}

export const useDeviceManagement = () => {
	const licensed = useHasLicenseModule('device-management') === true;
	const permitted = usePermission('view-device-management');

	useAdminRouteDefinition({
		enabled: licensed && permitted,
		id: 'device-management',
		path: '/admin/device-management/:context?/:id?',
		sidebar: {
			id: 'Device_Management',
			href: '/admin/device-management',
			icon: 'mobile',
		},
		element: <DeviceManagementAdminRoute />,
	});

	useAccountRouteDefinition({
		enabled: licensed,
		id: 'manage-devices',
		path: '/account/manage-devices',
		sidebar: {
			id: 'Manage_Devices',
			href: '/account/manage-devices',
			icon: 'mobile',
		},
		element: <DeviceManagementAccountPage />,
	});
};
