
import type { PrismaClient } from '../../prisma/prisma';
import { Command, Interaction, On, SlashCommandBuilder } from '@sodacore/discord';
import { Inject } from '@sodacore/di';
import { ChatInputCommandInteraction, Colors, EmbedBuilder, MessageFlags } from 'discord.js';

@Command(
	new SlashCommandBuilder()
		.setName('tasks')
		.setDescription('Task based management commands.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all tasks.'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('view')
				.setDescription('View a specific task.')
				.addNumberOption(option =>
					option.setName('id')
						.setDescription('The ID of the task to view.')
						.setRequired(true)
						.setAutocomplete(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Create a new task.')
				.addStringOption(option =>
					option.setName('title')
						.setDescription('The title of the task.')
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName('description')
						.setDescription('The description of the task.')
						.setRequired(true)
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Delete a task.')
				.addNumberOption(option =>
					option
						.setName('id')
						.setDescription('The ID of the task to delete.')
						.setRequired(true)
						.setAutocomplete(true),
				),
		),
)
export class TaskCommand {
	@Inject('prisma') private prisma!: PrismaClient;

	@On.SubCommand('create')
	public async onCreate(
		@Interaction() interaction: ChatInputCommandInteraction,
	) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const title = interaction.options.getString('title', true);
		const description = interaction.options.getString('description', true);

		const task = await this.prisma.todos.create({
			data: {
				title,
				description,
			},
		});

		return `Task created with ID: ${task.id}`;
	}

	@On.SubCommand('list')
	public async onList() {
		const tasks = await this.prisma.todos.findMany({
			select: {
				id: true,
				title: true,
				description: true,
				completed: true,
			},
			orderBy: {
				id: 'asc',
			},
		});

		if (tasks.length === 0) {
			return 'No tasks found.';
		}

		const embed = new EmbedBuilder()
			.setTitle('Task List')
			.setDescription(tasks.map(task => `**${task.id}**: ${task.title.replace('\n', ' ')} [${task.completed ? '✅' : '❌'}]\n${task.description ? task.description.replace('\n', ' ') : '__No Description__'}`).join('\n\n'))
			.setColor(Colors.Aqua);

		return { embeds: [embed] };
	}

	@On.SubCommand('view')
	public async onView(
		@Interaction() interaction: ChatInputCommandInteraction,
	) {
		const id = interaction.options.getNumber('id', true);
		const task = await this.prisma.todos.findUnique({
			where: { id },
			select: {
				id: true,
				title: true,
				description: true,
				completed: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!task) {
			return interaction.reply({ content: `Task with ID ${id} not found.` });
		}

		const embed = new EmbedBuilder()
			.setTitle(`Task #${task.id} - ${task.title}`)
			.setDescription(task.description || '__No Description__')
			.addFields(
				{ name: 'Status', value: task.completed ? '✅ Completed' : '❌ Not Completed', inline: false },
				{ name: 'Created At', value: task.createdAt.toISOString(), inline: false },
				{ name: 'Updated At', value: task.updatedAt.toISOString(), inline: false },
			)
			.setColor(Colors.Aqua);

		return interaction.reply({ embeds: [embed] });
	}

	@On.SubCommand('delete')
	public async onDelete(
		@Interaction() interaction: ChatInputCommandInteraction,
	) {
		const id = interaction.options.getNumber('id', true);
		const task = await this.prisma.todos.findUnique({
			where: { id },
		});

		if (!task) {
			return interaction.reply({ content: `Task with ID ${id} not found.`, flags: MessageFlags.Ephemeral });
		}

		await this.prisma.todos.delete({
			where: { id },
		});

		return interaction.reply({ content: `Task with ID ${id} has been deleted.`, flags: MessageFlags.Ephemeral });
	}

	@On.Autocomplete('id', 'view')
	public async onViewIdAutocomplete() {
		const tasks = await this.prisma.todos.findMany({
			select: {
				id: true,
				title: true,
			},
			orderBy: {
				id: 'asc',
			},
		});

		return tasks.map(task => ({
			name: String(task.title).length > 50 ? `${task.title.slice(0, 47)}...` : task.title,
			value: task.id,
		}));
	}

	@On.Autocomplete('id', 'delete')
	public async onDeleteIdAutocomplete() {
		const tasks = await this.prisma.todos.findMany({
			select: {
				id: true,
				title: true,
			},
			orderBy: {
				id: 'asc',
			},
		});

		return tasks.map(task => ({
			name: String(task.title).length > 50 ? `${task.title.slice(0, 47)}...` : task.title,
			value: task.id,
		}));
	}
}
