import { usePermission } from '@rocket.chat/ui-contexts';
import { lazy, useEffect } from 'react';

import { registerAccountRoute, registerAccountSidebarItem, unregisterSidebarItem } from '../../../../../client/views/account';
import { registerAdminRoute, registerAdminSidebarItem, unregisterAdminSidebarItem } from '../../../../../client/views/admin';
import { useHasLicenseModule } from '../../../hooks/useHasLicenseModule';

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
	const enabled = useHasLicenseModule('device-management');
	const canView = usePermission('view-device-management');

	const enabledForAdmin = enabled === true && canView;

	useEffect(() => {
		if (!enabledForAdmin) {
			return;
		}

		const [, unregisterAdminRoute] = registerAdminRoute('/device-management/:context?/:id?', {
			name: 'device-management',
			component: lazy(() => import('../../admin/deviceManagement/DeviceManagementAdminRoute')),
		});

		registerAdminSidebarItem({
			href: '/admin/device-management',
			i18nLabel: 'Device_Management',
			icon: 'mobile',
		});

		return () => {
			unregisterAdminRoute();
			unregisterAdminSidebarItem('Device_Management');
		};
	}, [enabledForAdmin]);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		const [, unregisterAccountRoute] = registerAccountRoute('/manage-devices', {
			name: 'manage-devices',
			component: lazy(() => import('../../account/deviceManagement/DeviceManagementAccountPage')),
		});

		registerAccountSidebarItem({
			href: '/account/manage-devices',
			i18nLabel: 'Manage_Devices',
			icon: 'mobile',
		});

		return () => {
			unregisterAccountRoute();
			unregisterSidebarItem('Manage_Devices');
		};
	}, [enabled]);
};
