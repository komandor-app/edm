import { isOmnichannelRoom, isVoipRoom } from '@rocket.chat/core-typings';
import React, { memo, ReactElement } from 'react';

import { useRoom } from '../../../contexts/RoomContext';
import { ComposerAnonymous } from './ComposerAnonymous';
import { ComposerBlocked } from './ComposerBlocked';
import { ComposerJoinWithPassword } from './ComposerJoinWithPassword';
import ComposerMessage, { ComposerMessageProps } from './ComposerMessage';
import { ComposerOmnichannel } from './ComposerOmnichannel/ComposerOmnichannel';
import { ComposerReadOnly } from './ComposerReadOnly';
import { RoomComposer } from './RoomComposer';
import { useMessageComposerIsAnonymous } from './hooks/useMessageComposerIsAnonymous';
import { useMessageComposerIsBlocked } from './hooks/useMessageComposerIsBlocked';
import { useMessageComposerIsReadOnly } from './hooks/useMessageComposerIsReadOnly';

const ComposerContainer = (props: ComposerMessageProps): ReactElement => {
	const isAnonymous = useMessageComposerIsAnonymous();
	const room = useRoom();

	const mustJoinWithCode = !props.subscription && room.joinCodeRequired;

	const isBlockedOrBlocker = useMessageComposerIsBlocked({ subscription: props.subscription });

	const isReadOnly = useMessageComposerIsReadOnly(props.rid, props.subscription);

	const isOmnichannel = isOmnichannelRoom(room) || isVoipRoom(room);

	if (isOmnichannel) {
		return <ComposerOmnichannel {...props} />;
	}

	if (isAnonymous) {
		return (
			<footer className='rc-message-box footer'>
				<ComposerAnonymous />
			</footer>
		);
	}

	if (mustJoinWithCode) {
		return (
			<footer className='rc-message-box footer'>
				<ComposerJoinWithPassword />
			</footer>
		);
	}

	if (isReadOnly) {
		return (
			<footer className='rc-message-box footer'>
				<ComposerReadOnly />
			</footer>
		);
	}

	if (isBlockedOrBlocker) {
		return (
			<footer className='rc-message-box footer'>
				<ComposerBlocked />
			</footer>
		);
	}

	return (
		<>
			<RoomComposer />
			{/* <ComposerMessage {...props} />; */}
		</>
	);
};

export default memo(ComposerContainer);