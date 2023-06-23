import type { ComponentMeta, ComponentStory } from '@storybook/react';

import Menu, { Group, Item } from '.';

export default {
	title: 'Components/Menu/Group',
	component: Group,
	parameters: {
		layout: 'centered',
	},
} satisfies ComponentMeta<typeof Group>;

export const Single: ComponentStory<typeof Group> = (args) => (
	<Menu>
		<Group {...args}>
			<Item>A menu item</Item>
			<Item>Another menu item</Item>
		</Group>
	</Menu>
);
Single.storyName = 'single';

export const Multiple: ComponentStory<typeof Group> = (args) => (
	<Menu>
		<Group {...args}>
			<Item>A menu item</Item>
			<Item>Another menu item</Item>
		</Group>
		<Group>
			<Item>Report</Item>
		</Group>
	</Menu>
);
Multiple.storyName = 'multiple';

export const WithTitle: ComponentStory<typeof Group> = (args) => (
	<Menu>
		<Group {...args}>
			<Item>A menu item</Item>
			<Item>Another menu item</Item>
		</Group>
	</Menu>
);
WithTitle.storyName = 'with title';
WithTitle.args = {
	title: 'Are you sure?',
};
