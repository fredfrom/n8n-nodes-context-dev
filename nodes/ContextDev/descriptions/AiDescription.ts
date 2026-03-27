import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const aiProperties: INodeProperties[] = [
	// Operation dropdown
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['aiExtraction'],
			},
		},
		options: [
			{
				name: 'AI Query',
				value: 'aiQuery',
				action: 'Run AI query to extract custom data points',
			},
			{
				name: 'Extract Brand Products',
				value: 'extractBrandProducts',
				action: 'Extract products from a brand website using AI',
			},
			{
				name: 'Extract Single Product',
				value: 'extractSingleProduct',
				action: 'Extract product data from a single product URL',
			},
		],
		default: 'aiQuery',
	},

	// Domain field for aiQuery
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['aiExtraction'],
				operation: ['aiQuery'],
			},
		},
		description: 'Domain to analyze (e.g. example.com)',
	},

	// dataToExtract fixedCollection for aiQuery
	{
		displayName: 'Data to Extract',
		name: 'dataToExtract',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Datapoint',
		default: {},
		displayOptions: {
			show: {
				resource: ['aiExtraction'],
				operation: ['aiQuery'],
			},
		},
		description: 'Array of datapoints to extract from the domain',
		options: [
			{
				name: 'values',
				displayName: 'Datapoint',
				values: [
					{
						displayName: 'Description',
						name: 'datapoint_description',
						type: 'string',
						default: '',
						description: 'What to extract — natural language instruction',
					},
					{
						displayName: 'Example',
						name: 'datapoint_example',
						type: 'string',
						required: true,
						default: '',
						description: 'Example value to guide extraction (required by the API)',
					},
					{
						displayName: 'List Item Type',
						name: 'datapoint_list_type',
						type: 'string',
						default: '',
						description: 'Item type when datapoint_type is list (optional)',
					},
					{
						displayName: 'Name',
						name: 'datapoint_name',
						type: 'string',
						default: '',
						description: 'Identifier for this datapoint',
					},
					{
						displayName: 'Type',
						name: 'datapoint_type',
						type: 'options',
						default: 'text',
						options: [
							{ name: 'Boolean', value: 'boolean' },
							{ name: 'Date', value: 'date' },
							{ name: 'List', value: 'list' },
							{ name: 'Number', value: 'number' },
							{ name: 'Text', value: 'text' },
							{ name: 'URL', value: 'url' },
						],
						description: 'Data type of this datapoint',
					},
				],
			},
		],
	},

	// Additional Fields for aiQuery
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['aiExtraction'],
				operation: ['aiQuery'],
			},
		},
		options: [
			{
				displayName: 'Specific Pages',
				name: 'specificPages',
				type: 'string',
				default: '',
				description:
					'Comma-separated page keys: home_page, blog, terms_and_conditions, privacy_policy, about_us, contact_us, careers, faq, pricing',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 30000,
				description: 'Request timeout in milliseconds',
			},
		],
	},

	// URL field for extractSingleProduct
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['aiExtraction'],
				operation: ['extractSingleProduct'],
			},
		},
		description: 'Product page URL to analyze',
	},

	// Additional Fields for extractSingleProduct
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['aiExtraction'],
				operation: ['extractSingleProduct'],
			},
		},
		options: [
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 30000,
				description: 'Request timeout in milliseconds',
			},
		],
	},

	// Domain field for extractBrandProducts
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['aiExtraction'],
				operation: ['extractBrandProducts'],
			},
		},
		description: 'Domain to extract products from',
	},

	// Additional Fields for extractBrandProducts
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['aiExtraction'],
				operation: ['extractBrandProducts'],
			},
		},
		options: [
			{
				displayName: 'Direct URL',
				name: 'directUrl',
				type: 'string',
				default: '',
				description: 'Specific URL — overrides Domain when set',
			},
			{
				displayName: 'Max Products',
				name: 'maxProducts',
				type: 'number',
				default: 10,
				description: 'Maximum products to extract (1–12)',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 30000,
				description: 'Request timeout in milliseconds',
			},
		],
	},
];

export async function executeAiOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
	baseUrl: string,
): Promise<INodeExecutionData> {
	let response: IDataObject;

	if (operation === 'aiQuery') {
		const domain = this.getNodeParameter('domain', i) as string;
		const dataToExtractRaw = this.getNodeParameter('dataToExtract', i, {}) as {
			values?: Array<{
				datapoint_name: string;
				datapoint_type: string;
				datapoint_description: string;
				datapoint_example: string;
				datapoint_list_type?: string;
			}>;
		};
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			timeoutMS?: number;
			specificPages?: string;
		};

		const dataToExtract = (dataToExtractRaw.values ?? []).map((entry) => {
			const point: IDataObject = {
				datapoint_name: entry.datapoint_name,
				datapoint_type: entry.datapoint_type,
				datapoint_description: entry.datapoint_description,
				datapoint_example: entry.datapoint_example,
			};
			if (entry.datapoint_list_type) point.datapoint_list_type = entry.datapoint_list_type;
			return point;
		});

		const body: IDataObject = { domain, data_to_extract: dataToExtract };
		if (additionalFields.timeoutMS !== undefined) body.timeoutMS = additionalFields.timeoutMS;
		if (additionalFields.specificPages && additionalFields.specificPages.trim()) {
			const keys = additionalFields.specificPages.split(',');
			body.specific_pages = Object.fromEntries(keys.map((k) => [k.trim(), true]));
		}

		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'POST',
			url: `${baseUrl}/brand/ai/query`,
			body,
			json: true,
		})) as IDataObject;
	} else if (operation === 'extractSingleProduct') {
		const url = this.getNodeParameter('url', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			timeoutMS?: number;
		};

		const body: IDataObject = { url };
		if (additionalFields.timeoutMS !== undefined) body.timeoutMS = additionalFields.timeoutMS;

		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'POST',
			url: `${baseUrl}/brand/ai/product`,
			body,
			json: true,
		})) as IDataObject;
	} else if (operation === 'extractBrandProducts') {
		const domain = this.getNodeParameter('domain', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			directUrl?: string;
			maxProducts?: number;
			timeoutMS?: number;
		};

		const body: IDataObject = additionalFields.directUrl
			? { directUrl: additionalFields.directUrl }
			: { domain };
		if (additionalFields.maxProducts !== undefined) body.maxProducts = additionalFields.maxProducts;
		if (additionalFields.timeoutMS !== undefined) body.timeoutMS = additionalFields.timeoutMS;

		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'POST',
			url: `${baseUrl}/brand/ai/products`,
			body,
			json: true,
		})) as IDataObject;
	} else {
		throw new NodeOperationError(
			this.getNode(),
			`Unknown AI Extraction operation: ${operation}`,
			{ itemIndex: i },
		);
	}

	return { json: response, pairedItem: { item: i } };
}
