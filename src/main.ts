import { Application } from '@sodacore/core';
import { env } from 'bun';
import { resolve } from 'node:path';
import process from 'node:process';
import HttpPlugin from '@sodacore/http';
import DiscordPlugin from '@sodacore/discord';
import PrismaPlugin from '@sodacore/prisma';
import I18nPlugin from '@sodacore/i18n';
import WsPlugin from '@sodacore/ws';

// Initialise application.
const app = new Application({
	name: 'Sodacore Demo',
	autowire: true,
	enableCli: true,
	password: env.CLI_PASSWORD,
	basePath: env.SODACORE_ENV === 'prod'
		? resolve(process.cwd(), './dist')
		: undefined,
});

// Install the HTTP plugin.
app.use(new HttpPlugin({
	port: env.HTTP_PORT ? parseInt(env.HTTP_PORT) : 8080,
}));

// Install the Discord plugin.
app.use(new DiscordPlugin({
	token: env.DISCORD_TOKEN,
	clientId: env.DISCORD_CLIENT_ID,
	guildId: env.DISCORD_GUILD_ID,
}));

// Install the WebSocket plugin.
app.use(new WsPlugin({
	path: '/ws',
}));

// Install the Prisma plugin.
app.use(new PrismaPlugin());

// Install the I18n plugin.
app.use(new I18nPlugin({
	defaultLang: 'en-GB',
}));

// Start the application.
app.start().catch(console.error);
