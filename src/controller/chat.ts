import type { PrismaClient } from '../../prisma/prisma';
import { Controller, Expose, WsConnections, WsContext } from '@sodacore/ws';
import { Inject } from '@sodacore/di';

@Controller('chat')
export class ChatController {
	@Inject('prisma') private readonly prisma!: PrismaClient
	@Inject() private readonly connections!: WsConnections;

	@Expose()
	public async send(context: WsContext) {
		const content = context.getData<{ username: string; message: string }>();
		const message = await this.prisma.chatMessages.create({
			data: content,
		});
		this.connections.broadcast('message', message);
	}
}
