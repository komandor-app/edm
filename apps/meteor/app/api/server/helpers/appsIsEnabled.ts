import type { SettingValue } from '@rocket.chat/core-typings';

import type { AppServerOrchestrator } from '../../../apps/server/orchestrator';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';
import { API } from '../api';

API.helperMethods.set(
	'/apps/is-enabled',
	function _isEnabled(component: { orch: AppServerOrchestrator; [key: string]: unknown }): SettingValue {
		methodDeprecationLogger.warn('/apps/is-enabled will be deprecated in future versions of Rocket.Chat');
		return typeof component.orch !== 'undefined' && component.orch.isEnabled();
	},
);