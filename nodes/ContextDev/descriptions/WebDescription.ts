import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const webProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['web'],
			},
		},
		options: [
			{
				name: 'Scrape to Markdown',
				value: 'scrapeMarkdown',
				action: 'Scrape a url to markdown',
			},
			{
				name: 'Scrape to HTML',
				value: 'scrapeHtml',
				action: 'Scrape a URL to HTML',
			},
			{
				name: 'Extract Images',
				value: 'extractImages',
				action: 'Extract images from a URL',
			},
			{
				name: 'Crawl Sitemap',
				value: 'crawlSitemap',
				action: 'Crawl a website sitemap',
			},
		],
		default: 'scrapeMarkdown',
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['web'],
				operation: ['scrapeMarkdown', 'scrapeHtml', 'extractImages'],
			},
		},
		description: 'The URL to scrape',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['web'],
				operation: ['crawlSitemap'],
			},
		},
		description: 'Domain to crawl (e.g. example.com)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['web'],
				operation: ['scrapeMarkdown'],
			},
		},
		options: [
			{
				displayName: 'Include Links',
				name: 'includeLinks',
				type: 'boolean',
				default: true,
				description: 'Whether to preserve hyperlinks in Markdown output',
			},
			{
				displayName: 'Include Images',
				name: 'includeImages',
				type: 'boolean',
				default: false,
				description: 'Whether to include image references in Markdown output',
			},
			{
				displayName: 'Shorten Base64 Images',
				name: 'shortenBase64Images',
				type: 'boolean',
				default: true,
				description: 'Whether to shorten base64 image data in Markdown output',
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['web'],
				operation: ['crawlSitemap'],
			},
		},
		options: [
			{
				displayName: 'Max Links',
				name: 'maxLinks',
				type: 'number',
				default: 10000,
				description: 'Maximum number of URLs to return (1–100,000)',
			},
		],
	},
];

export async function executeWebOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
	baseUrl: string,
): Promise<INodeExecutionData> {
	let response: IDataObject;

	if (operation === 'scrapeMarkdown') {
		const url = this.getNodeParameter('url', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			includeLinks?: boolean;
			includeImages?: boolean;
			shortenBase64Images?: boolean;
		};
		const qs: IDataObject = { url };
		if (additionalFields.includeLinks !== undefined) qs.includeLinks = additionalFields.includeLinks;
		if (additionalFields.includeImages !== undefined) qs.includeImages = additionalFields.includeImages;
		if (additionalFields.shortenBase64Images !== undefined) qs.shortenBase64Images = additionalFields.shortenBase64Images;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/web/scrape/markdown`,
			qs,
		})) as IDataObject;
	} else if (operation === 'scrapeHtml') {
		const url = this.getNodeParameter('url', i) as string;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/web/scrape/html`,
			qs: { url },
		})) as IDataObject;
	} else if (operation === 'extractImages') {
		const url = this.getNodeParameter('url', i) as string;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/web/scrape/images`,
			qs: { url },
		})) as IDataObject;
	} else if (operation === 'crawlSitemap') {
		const domain = this.getNodeParameter('domain', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			maxLinks?: number;
		};
		const qs: IDataObject = { domain };
		if (additionalFields.maxLinks !== undefined) qs.maxLinks = additionalFields.maxLinks;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/web/scrape/sitemap`,
			qs,
		})) as IDataObject;
	} else {
		throw new NodeOperationError(this.getNode(), `Unknown web operation: ${operation}`, {
			itemIndex: i,
		});
	}

	return { json: response, pairedItem: { item: i } };
}
