import { Body, Controller, Delete, Get, Params, Patch, Post, Put } from '@sodacore/http';
import { PrismaClient } from '../../prisma/prisma/client';
import { Inject } from '@sodacore/di';
import { WsConnections } from '@sodacore/ws';
import { Hook } from '@sodacore/core';

@Controller('/api')
export default class TodoApiController {
	@Inject('prisma') private readonly prisma!: PrismaClient;
	@Inject() private readonly connections!: WsConnections;

	@Hook('wsOpen')
	public async onWsOpen() {
		this.connections.broadcast('userCount', {
			count: this.connections.getConnectionCount(),
		});
	}

	@Hook('wsClose')
	public async onWsClose() {
		this.connections.broadcast('userCount', {
			count: this.connections.getConnectionCount(),
		});
	}

	@Get('/messages')
	public async getMessages() {
		return this.prisma.chatMessages.findMany({
			orderBy: {
				createdAt: 'asc',
			},
		});
	}

	@Get('/')
	public async list() {
		return this.prisma.todos.findMany();
	}

	@Post('/')
	public async create(@Body() body: { title: string, description?: string }) {
		const createTodo = await this.prisma.todos.create({
			data: {
				title: body.title,
				description: body.description,
			},
		});
		this.connections.broadcast('refresh');
		return createTodo;
	}

	@Get('/:id')
	public async get(@Params('id') id: number) {
		return await this.prisma.todos.findUnique({
			where: { id },
		});
	}

	@Put('/:id')
	public async replace(@Params('id') id: number, @Body() body: { title: string, description?: string }) {
		const todo = await this.prisma.todos.update({
			where: { id },
			data: {
				title: body.title,
				description: body.description,
			},
		});
		if (!todo) {
			throw new Error('Todo not found');
		}
		this.connections.broadcast('refresh');
		return todo;
	}

	@Patch('/:id')
	public async update(@Params('id') id: number, @Body() body: { title?: string, description?: string, completed?: boolean }) {
		const todo = await this.prisma.todos.update({
			where: { id },
			data: {
				title: body.title,
				description: body.description,
				completed: body.completed,
			},
		});
		this.connections.broadcast('refresh');
		return todo;
	}

	@Delete('/:id')
	public async delete(@Params('id') id: number) {
		const todo = await this.prisma.todos.delete({
			where: { id },
		});
		this.connections.broadcast('refresh');
		return todo;
	}
}
