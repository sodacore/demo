import { Controller, Get, Params, Query, Request } from '@sodacore/http';
import { resolve } from 'node:path';
import { file } from 'bun';
import { Inject } from '@sodacore/di';
import { I18nProvider } from '@sodacore/i18n';

@Controller('/')
export default class TodoController {
	@Inject() private readonly translator!: I18nProvider;
	private readonly basePath = resolve(process.cwd(), './public');

	@Get('/')
	public async index(
		@Request() request: Request,
		@Query('locale') locale?: string,
	) {

		// Get the index file.
		const indexPath = resolve(this.basePath, 'index.html');
		const fileContent = await file(indexPath).text();

		// Check available locale.
		const acceptLanguage: string = request.headers.get('accept-language') ?? 'en-GB';
		const availableLanguageCode = locale || this.translator.getAvailableTranslation(acceptLanguage) || 'en-GB';

		// Translate the content (or strip the _t() tags)
		const translatedContent = this.translator.autoTranslate(fileContent, availableLanguageCode);

		// Return the translated content.
		return new Response(translatedContent, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
			},
		});
	}

	@Get('/:asset')
	public async get(@Params('asset') asset: string) {
		const assetPath = resolve(this.basePath, asset.replaceAll('..', ''));
		if (!assetPath.startsWith(this.basePath)) {
			return new Response('Forbidden', { status: 403 });
		}
		const assetFile = file(assetPath);
		if (!await assetFile.exists()) {
			return new Response('Not Found', { status: 404 });
		}
		return new Response(assetFile);
	}
}
