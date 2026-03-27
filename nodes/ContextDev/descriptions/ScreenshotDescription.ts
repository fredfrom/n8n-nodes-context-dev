import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const screenshotProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['screenshot'],
			},
		},
		options: [
			{
				name: 'Take Screenshot',
				value: 'takeScreenshot',
				action: 'Take a screenshot of a website',
			},
		],
		default: 'takeScreenshot',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['screenshot'],
				operation: ['takeScreenshot'],
			},
		},
		description: 'Domain to screenshot (e.g. example.com)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['screenshot'],
				operation: ['takeScreenshot'],
			},
		},
		options: [
			{
				displayName: 'Full Page Screenshot',
				name: 'fullScreenshot',
				type: 'boolean',
				default: false,
				description: 'Whether to capture a full-page screenshot instead of viewport',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'options',
				default: '',
				options: [
					{ name: 'Blog', value: 'blog' },
					{ name: 'Careers', value: 'careers' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Default', value: '' },
					{ name: 'Login', value: 'login' },
					{ name: 'Pricing', value: 'pricing' },
					{ name: 'Privacy', value: 'privacy' },
					{ name: 'Signup', value: 'signup' },
					{ name: 'Terms', value: 'terms' },
				],
				description: 'Specific page to screenshot',
			},
			{
				displayName: 'Prioritize',
				name: 'prioritize',
				type: 'options',
				default: '',
				options: [
					{ name: 'Default', value: '' },
					{ name: 'Quality', value: 'quality' },
					{ name: 'Speed', value: 'speed' },
				],
				description: 'Whether to optimize for speed or image quality',
			},
		],
	},
];

export async function executeScreenshotOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
	baseUrl: string,
): Promise<INodeExecutionData> {
	if (operation !== 'takeScreenshot') {
		throw new NodeOperationError(this.getNode(), `Unknown screenshot operation: ${operation}`, {
			itemIndex: i,
		});
	}

	const domain = this.getNodeParameter('domain', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
		fullScreenshot?: boolean;
		page?: string;
		prioritize?: string;
	};

	// Build query string — only include optional params when set
	const qs: IDataObject = { domain };
	if (additionalFields.fullScreenshot !== undefined) qs.fullScreenshot = additionalFields.fullScreenshot;
	if (additionalFields.page) qs.page = additionalFields.page;
	if (additionalFields.prioritize) qs.prioritize = additionalFields.prioritize;

	// Step 1: Fetch screenshot JSON from Context.dev API (returns CDN URL, not binary)
	// Confirmed response shape: { status, domain, screenshot: "https://media.brand.dev/...png", screenshotType, code }
	const screenshotResponse = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'contextDevApi',
		{ method: 'GET', url: `${baseUrl}/brand/screenshot`, qs },
	)) as { screenshot: string; screenshotType: string; domain: string; status: string; code: number };

	const imageUrl = screenshotResponse.screenshot;

	// Step 2: Download binary image from CDN URL — no auth needed for CDN
	// IMPORTANT: Use encoding: 'arraybuffer' (not encoding: null — legacy pattern, breaks on n8n v1+)
	// IMPORTANT: Use this.helpers.httpRequest() NOT httpRequestWithAuthentication — CDN has no API key
	const imageResponse = (await this.helpers.httpRequest({
		method: 'GET',
		url: imageUrl,
		encoding: 'arraybuffer',
		returnFullResponse: true,
	})) as { body: ArrayBuffer; headers: Record<string, string> };

	const imageBuffer = Buffer.from(imageResponse.body);
	const mimeType = imageResponse.headers['content-type'] ?? 'image/png';
	const filename = `screenshot-${domain}.png`;

	// Step 3: Wrap as n8n binary data
	const binaryData = await this.helpers.prepareBinaryData(imageBuffer, filename, mimeType);

	return {
		json: {
			domain: screenshotResponse.domain,
			screenshotUrl: imageUrl,
			screenshotType: screenshotResponse.screenshotType,
			status: screenshotResponse.status,
			code: screenshotResponse.code,
		},
		binary: { data: binaryData }, // 'data' is the standard n8n binary field name
		pairedItem: { item: i },
	};
}
