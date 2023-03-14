import { Meteor } from 'meteor/meteor';
import type { ILivechatDepartment, ILivechatInquiryRecord, IOmnichannelAgent } from '@rocket.chat/core-typings';

import { APIClient, getUserPreference } from '../../../../utils/client';
import { LivechatInquiry } from '../../collections/LivechatInquiry';
import { inquiryDataStream } from './inquiry';
import { callWithErrorHandling } from '../../../../../client/lib/utils/callWithErrorHandling';
import { CustomSounds } from '../../../../custom-sounds/client/lib/CustomSounds';
import { settings } from '../../../../settings/client';

const departments = new Set();

type ILivechatInquiryWithType = ILivechatInquiryRecord & { type?: 'added' | 'removed' | 'changed' };

export const getPoolMaxIncomingAndQueuedChatsCount = (userId: IOmnichannelAgent['_id']) => {
	const poolMaxIncoming = settings.get('Livechat_guest_pool_max_number_incoming_livechats_displayed');
	const queuedChatsCount = poolMaxIncoming
		? LivechatInquiry.find(
				{
					status: 'queued',
					$or: [{ defaultAgent: { $exists: false } }, { 'defaultAgent.agentId': userId }],
				},
				{
					limit: poolMaxIncoming,
				},
		  ).count()
		: 0;
	return { poolMaxIncoming, queuedChatsCount };
};

const newInquirySound = () => {
	const user = Meteor.user() as IOmnichannelAgent;
	const audioVolume = getUserPreference(user?._id, 'notificationsSoundVolume') as number;
	const newRoomNotification = getUserPreference(user?._id, 'newRoomNotification');
	const isAgentAvailable = user.statusLivechat === 'available';

	if (!isAgentAvailable || newRoomNotification === 'none') {
		return;
	}

	CustomSounds.play(newRoomNotification, {
		volume: Number((audioVolume / 100).toPrecision(2)),
	});
};

const events = {
	added: (inquiry: ILivechatInquiryWithType) => {
		delete inquiry.type;
		departments.has(inquiry.department) && LivechatInquiry.insert({ ...inquiry, alert: true, _updatedAt: new Date(inquiry._updatedAt) });
		const userId = Meteor.userId() as ILivechatInquiryRecord['_id'];
		const { poolMaxIncoming, queuedChatsCount } = getPoolMaxIncomingAndQueuedChatsCount(userId);

		if (queuedChatsCount >= poolMaxIncoming) {
			return;
		}

		newInquirySound();
	},
	changed: (inquiry: ILivechatInquiryWithType) => {
		if (inquiry.status !== 'queued' || (inquiry.department && !departments.has(inquiry.department))) {
			return LivechatInquiry.remove(inquiry._id);
		}
		delete inquiry.type;
		const saveResult = LivechatInquiry.upsert({ _id: inquiry._id }, { ...inquiry, alert: true, _updatedAt: new Date(inquiry._updatedAt) });

		if (!saveResult?.insertedId) {
			return;
		}

		newInquirySound();
	},
	removed: (inquiry: ILivechatInquiryWithType) => {
		LivechatInquiry.remove(inquiry._id);
		const userId = Meteor.userId() as ILivechatInquiryRecord['_id'];
		const { poolMaxIncoming, queuedChatsCount } = getPoolMaxIncomingAndQueuedChatsCount(userId);

		if (queuedChatsCount < poolMaxIncoming) {
			return;
		}

		newInquirySound();
	},
};

const updateCollection = (inquiry: ILivechatInquiryWithType) => {
	if (!inquiry.type) {
		return;
	}
	events[inquiry.type](inquiry);
};

const getInquiriesFromAPI = async () => {
	const { inquiries } = await APIClient.get('/v1/livechat/inquiries.queuedForUser', {});
	return inquiries;
};

const removeListenerOfDepartment = (departmentId: ILivechatDepartment['_id']) => {
	inquiryDataStream.removeListener(`department/${departmentId}`, updateCollection);
	departments.delete(departmentId);
};

const appendListenerToDepartment = (departmentId: ILivechatDepartment['_id']) => {
	departments.add(departmentId);
	inquiryDataStream.on(`department/${departmentId}`, updateCollection);
	return () => removeListenerOfDepartment(departmentId);
};
const addListenerForeachDepartment = (departments: ILivechatDepartment['_id'][] = []) => {
	const cleanupFunctions = departments.map((department) => appendListenerToDepartment(department));
	return () => cleanupFunctions.forEach((cleanup) => cleanup());
};

const updateInquiries = async (inquiries: ILivechatInquiryRecord[] = []) =>
	inquiries.forEach((inquiry) => LivechatInquiry.upsert({ _id: inquiry._id }, { ...inquiry, _updatedAt: new Date(inquiry._updatedAt) }));

const getAgentsDepartments = async (userId: IOmnichannelAgent['_id']) => {
	const { departments } = await APIClient.get(`/v1/livechat/agents/${userId}/departments`, { enabledDepartmentsOnly: 'true' });
	return departments;
};

const removeGlobalListener = () => inquiryDataStream.removeListener('public', updateCollection);

const addGlobalListener = () => {
	inquiryDataStream.on('public', updateCollection);
	return removeGlobalListener;
};

const subscribe = async (userId: IOmnichannelAgent['_id']) => {
	const config = await callWithErrorHandling('livechat:getRoutingConfig');
	if (config?.autoAssignAgent) {
		return;
	}

	const agentDepartments = (await getAgentsDepartments(userId)).map((department) => department.departmentId);

	// Register to all depts + public queue always to match the inquiry list returned by backend
	const cleanDepartmentListeners = addListenerForeachDepartment(agentDepartments);
	const globalCleanup = addGlobalListener();
	const inquiriesFromAPI = (await getInquiriesFromAPI()) as unknown as ILivechatInquiryRecord[];

	updateInquiries(inquiriesFromAPI);

	return () => {
		LivechatInquiry.remove({});
		removeGlobalListener();
		cleanDepartmentListeners?.();
		globalCleanup?.();
		departments.clear();
	};
};

export const initializeLivechatInquiryStream = (() => {
	let cleanUp: (() => void) | undefined;

	return async (...args: any[]) => {
		cleanUp?.();
		cleanUp = await subscribe(...(args as [IOmnichannelAgent['_id']]));
	};
})();
