import { action } from '@storybook/addon-actions';
import type { ComponentMeta, ComponentStory } from '@storybook/react';

import Menu, { Group, Item } from '.';
import BellIcon from '../../icons/bell.svg';
import ChangeIcon from '../../icons/change.svg';
import CloseIcon from '../../icons/close.svg';
import FinishIcon from '../../icons/finish.svg';

export default {
	title: 'Components/Menu/Item',
	component: Item,
	args: {
		children: 'A menu item',
		onClick: action('clicked'),
	},
} satisfies ComponentMeta<typeof Item>;

export const Simple: ComponentStory<typeof Item> = (args) => (
	<Menu>
		<Group>
			<Item {...args} />
			<Item>Another menu item</Item>
		</Group>
	</Menu>
);
Simple.storyName = 'simple';

export const Primary: ComponentStory<typeof Item> = (args) => (
	<Menu>
		<Group>
			<Item {...args} />
			<Item>Another menu item</Item>
		</Group>
	</Menu>
);
Primary.storyName = 'primary';
Primary.args = {
	primary: true,
};

export const Danger: ComponentStory<typeof Item> = (args) => (
	<Menu>
		<Group>
			<Item {...args} />
			<Item>Another menu item</Item>
		</Group>
	</Menu>
);
Danger.storyName = 'danger';
Danger.args = {
	danger: true,
};

export const Disabled: ComponentStory<typeof Item> = (args) => (
	<Menu>
		<Group>
			<Item {...args} />
			<Item>Another menu item</Item>
		</Group>
	</Menu>
);
Disabled.storyName = 'disabled';
Disabled.args = {
	disabled: true,
};

export const WithIcon: ComponentStory<typeof Item> = (args) => (
	<Menu>
		<Group>
			<Item {...args} />
			<Item primary icon={ChangeIcon} onClick={action('clicked')}>
				Primary
			</Item>
			<Item danger icon={FinishIcon} onClick={action('clicked')}>
				Danger
			</Item>
			<Item disabled icon={BellIcon} onClick={action('clicked')}>
				Disabled
			</Item>
		</Group>
	</Menu>
);
WithIcon.storyName = 'with icon';
WithIcon.args = {
	children: 'Simple',
	icon: CloseIcon,
};
