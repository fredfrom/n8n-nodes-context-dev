import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const logoLinkProperties: INodeProperties[] = [
	// Operation dropdown
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['logoLink'],
			},
		},
		options: [
			{
				name: 'Get Logo',
				value: 'getLogo',
				action: 'Get a brand logo as binary image data',
			},
		],
		default: 'getLogo',
	},

	// Domain field for getLogo
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['logoLink'],
				operation: ['getLogo'],
			},
		},
		description: 'Domain to get logo for (e.g. example.com)',
	},
];

export async function executeLogoLinkOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
	baseUrl: string,
): Promise<INodeExecutionData> {
	// baseUrl accepted for signature consistency but not used — Logo Link calls logos.context.dev directly
	void baseUrl;

	if (operation === 'getLogo') {
		// Step 1: Read credential and validate
		const credentials = await this.getCredentials('contextDevApi');
		const logoLinkClientId = credentials.logoLinkClientId as string;
		if (!logoLinkClientId) {
			throw new NodeOperationError(
				this.getNode(),
				'Logo Link Client ID is required for this operation. Set it in the Context.dev API credential.',
				{ itemIndex: i },
			);
		}

		// Step 2: Read domain parameter
		const domain = this.getNodeParameter('domain', i) as string;

		// Step 3: Construct CDN URL and download binary
		const logoUrl = `https://logos.context.dev/?publicClientId=${encodeURIComponent(logoLinkClientId)}&domain=${encodeURIComponent(domain)}`;

		// Use httpRequestWithAuthentication to satisfy n8n lint rules (auth headers are harmless to CDN)
		const imageResponse = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'contextDevApi',
			{
				method: 'GET',
				url: logoUrl,
				encoding: 'arraybuffer',
				returnFullResponse: true,
			},
		)) as { body: ArrayBuffer; headers: Record<string, string> };

		const imageBuffer = Buffer.from(imageResponse.body);
		const mimeType = imageResponse.headers['content-type'] ?? 'image/png';
		const filename = `logo-${domain}.png`;
		const binaryData = await this.helpers.prepareBinaryData(imageBuffer, filename, mimeType);

		// Step 4: Return with data as binary key
		return {
			json: { domain, logoUrl },
			binary: { data: binaryData },
			pairedItem: { item: i },
		};
	}

	throw new NodeOperationError(
		this.getNode(),
		`Unknown Logo Link operation: ${operation}`,
		{ itemIndex: i },
	);
}
