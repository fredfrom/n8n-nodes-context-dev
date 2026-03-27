import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const brandProperties: INodeProperties[] = [
	// Operation dropdown
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['brand'],
			},
		},
		options: [
			{
				name: 'Classify Industry (NAICS)',
				value: 'classifyIndustry',
				action: 'Classify a company by industry and sector',
			},
			{
				name: 'Extract Colors',
				value: 'extractColors',
				action: 'Extract brand colors from a website',
			},
			{
				name: 'Extract Fonts',
				value: 'extractFonts',
				action: 'Extract fonts from a website',
			},
			{
				name: 'Extract Products',
				value: 'extractProducts',
				action: 'Extract products from a website using AI',
			},
			{
				name: 'Extract Styleguide',
				value: 'extractStyleguide',
				action: 'Extract full design styleguide from a website',
			},
			{
				name: 'Get by Company Name',
				value: 'getByName',
				action: 'Get brand profile by company name',
			},
			{
				name: 'Get by Domain',
				value: 'getByDomain',
				action: 'Get brand profile by domain',
			},
			{
				name: 'Get by Email',
				value: 'getByEmail',
				action: 'Get brand profile by email address',
			},
			{
				name: 'Get by ISIN',
				value: 'getByIsin',
				action: 'Get brand profile by ISIN code',
			},
			{
				name: 'Get by Stock Ticker',
				value: 'getByTicker',
				action: 'Get brand profile by stock ticker',
			},
			{
				name: 'Prefetch',
				value: 'prefetch',
				action: 'Prefetch and cache brand data 0 credits',
			},
		],
		default: 'getByDomain',
	},

	// Domain field — shared by getByDomain, extractColors, extractFonts, extractStyleguide, extractProducts, prefetch, classifyIndustry
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: [
					'getByDomain',
					'extractColors',
					'extractFonts',
					'extractStyleguide',
					'extractProducts',
					'prefetch',
					'classifyIndustry',
				],
			},
		},
		description: 'Domain name (e.g. example.com)',
	},

	// Email field
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['getByEmail'],
			},
		},
		description: 'Email address (not free providers like gmail.com)',
	},

	// Company Name field
	{
		displayName: 'Company Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['getByName'],
			},
		},
		description: 'Company name (3\u201330 characters)',
	},

	// Ticker field
	{
		displayName: 'Ticker',
		name: 'ticker',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['getByTicker'],
			},
		},
		description: 'Stock ticker symbol (e.g. AAPL)',
	},

	// ISIN field
	{
		displayName: 'ISIN',
		name: 'isin',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['getByIsin'],
			},
		},
		description: 'ISIN code (12 characters, e.g. US0378331005)',
	},

	// Input field for classifyIndustry
	{
		displayName: 'Input',
		name: 'input',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['classifyIndustry'],
			},
		},
		description: 'Domain or brand name to classify',
	},

	// Additional Fields for getByDomain and extractColors (same endpoint)
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['getByDomain', 'extractColors'],
			},
		},
		options: [
			{
				displayName: 'Force Language',
				name: 'force_language',
				type: 'string',
				default: '',
				description: 'Language code for response (e.g. en, de, fr)',
			},
			{
				displayName: 'Max Speed',
				name: 'maxSpeed',
				type: 'boolean',
				default: false,
				description: 'Whether to skip slower AI enrichments for faster response',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 5000,
				description: 'Request timeout in milliseconds',
			},
		],
	},

	// Additional Fields for getByEmail
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['getByEmail'],
			},
		},
		options: [
			{
				displayName: 'Force Language',
				name: 'force_language',
				type: 'string',
				default: '',
				description: 'Language code for response (e.g. en, de, fr)',
			},
			{
				displayName: 'Max Speed',
				name: 'maxSpeed',
				type: 'boolean',
				default: false,
				description: 'Whether to skip slower AI enrichments for faster response',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 5000,
				description: 'Request timeout in milliseconds',
			},
		],
	},

	// Additional Fields for getByName
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['getByName'],
			},
		},
		options: [
			{
				displayName: 'Country Code',
				name: 'country_gl',
				type: 'string',
				default: '',
				description: 'Two-letter country code to narrow search (e.g. US, DE)',
			},
			{
				displayName: 'Force Language',
				name: 'force_language',
				type: 'string',
				default: '',
				description: 'Language code for response',
			},
			{
				displayName: 'Max Speed',
				name: 'maxSpeed',
				type: 'boolean',
				default: false,
				description: 'Whether to skip slower AI enrichments for faster response',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 5000,
				description: 'Request timeout in milliseconds',
			},
		],
	},

	// Additional Fields for getByTicker
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['getByTicker'],
			},
		},
		options: [
			{
				displayName: 'Force Language',
				name: 'force_language',
				type: 'string',
				default: '',
				description: 'Language code for response',
			},
			{
				displayName: 'Max Speed',
				name: 'maxSpeed',
				type: 'boolean',
				default: false,
				description: 'Whether to skip slower AI enrichments for faster response',
			},
			{
				displayName: 'Ticker Exchange',
				name: 'ticker_exchange',
				type: 'string',
				default: '',
				description: 'Exchange code to disambiguate ticker (e.g. NASDAQ, NYSE)',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 5000,
				description: 'Request timeout in milliseconds',
			},
		],
	},

	// Additional Fields for getByIsin
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['getByIsin'],
			},
		},
		options: [
			{
				displayName: 'Force Language',
				name: 'force_language',
				type: 'string',
				default: '',
				description: 'Language code for response',
			},
			{
				displayName: 'Max Speed',
				name: 'maxSpeed',
				type: 'boolean',
				default: false,
				description: 'Whether to skip slower AI enrichments for faster response',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 5000,
				description: 'Request timeout in milliseconds',
			},
		],
	},

	// Additional Fields for extractFonts
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['extractFonts'],
			},
		},
		options: [
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 5000,
				description: 'Request timeout in milliseconds',
			},
		],
	},

	// Additional Fields for extractStyleguide
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['extractStyleguide'],
			},
		},
		options: [
			{
				displayName: 'Direct URL',
				name: 'directUrl',
				type: 'string',
				default: '',
				description: 'Direct page URL \u2014 overrides Domain when set',
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
				description: 'Whether to optimize for speed or quality',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 5000,
				description: 'Request timeout in milliseconds',
			},
		],
	},

	// Additional Fields for extractProducts (BRND-08 — POST /brand/ai/products)
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['extractProducts'],
			},
		},
		options: [
			{
				displayName: 'Max Products',
				name: 'maxProducts',
				type: 'number',
				default: 10,
				description: 'Maximum number of products to extract',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 30000,
				description: 'Request timeout in milliseconds (AI operations may take longer)',
			},
		],
	},

	// Additional Fields for prefetch (BRND-09 — POST /brand/prefetch)
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['prefetch'],
			},
		},
		options: [
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 5000,
				description: 'Request timeout in milliseconds',
			},
		],
	},

	// Additional Fields for classifyIndustry
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['brand'],
				operation: ['classifyIndustry'],
			},
		},
		options: [
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				default: 5,
				description: 'Maximum number of NAICS codes to return (1\u201310)',
			},
			{
				displayName: 'Min Results',
				name: 'minResults',
				type: 'number',
				default: 1,
				description: 'Minimum number of NAICS codes to return',
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 5000,
				description: 'Request timeout in milliseconds',
			},
		],
	},
];

export async function executeBrandOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
	baseUrl: string,
): Promise<INodeExecutionData> {
	let response: IDataObject;

	if (operation === 'getByDomain' || operation === 'extractColors') {
		// BRND-01 and BRND-05 call the same endpoint — full response returned, user extracts brand.colors via expression
		const domain = this.getNodeParameter('domain', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			force_language?: string;
			maxSpeed?: boolean;
			timeoutMS?: number;
		};
		const qs: IDataObject = { domain };
		if (additionalFields.force_language) qs.force_language = additionalFields.force_language;
		if (additionalFields.maxSpeed !== undefined) qs.maxSpeed = additionalFields.maxSpeed;
		if (additionalFields.timeoutMS !== undefined) qs.timeoutMS = additionalFields.timeoutMS;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/brand/retrieve`,
			qs,
		})) as IDataObject;
	} else if (operation === 'getByEmail') {
		const email = this.getNodeParameter('email', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			force_language?: string;
			maxSpeed?: boolean;
			timeoutMS?: number;
		};
		const qs: IDataObject = { email };
		if (additionalFields.force_language) qs.force_language = additionalFields.force_language;
		if (additionalFields.maxSpeed !== undefined) qs.maxSpeed = additionalFields.maxSpeed;
		if (additionalFields.timeoutMS !== undefined) qs.timeoutMS = additionalFields.timeoutMS;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/brand/retrieve-by-email`,
			qs,
		})) as IDataObject;
	} else if (operation === 'getByName') {
		const name = this.getNodeParameter('name', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			force_language?: string;
			maxSpeed?: boolean;
			country_gl?: string;
			timeoutMS?: number;
		};
		const qs: IDataObject = { name };
		if (additionalFields.force_language) qs.force_language = additionalFields.force_language;
		if (additionalFields.maxSpeed !== undefined) qs.maxSpeed = additionalFields.maxSpeed;
		if (additionalFields.country_gl) qs.country_gl = additionalFields.country_gl;
		if (additionalFields.timeoutMS !== undefined) qs.timeoutMS = additionalFields.timeoutMS;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/brand/retrieve-by-name`,
			qs,
		})) as IDataObject;
	} else if (operation === 'getByTicker') {
		const ticker = this.getNodeParameter('ticker', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			force_language?: string;
			maxSpeed?: boolean;
			ticker_exchange?: string;
			timeoutMS?: number;
		};
		const qs: IDataObject = { ticker };
		if (additionalFields.force_language) qs.force_language = additionalFields.force_language;
		if (additionalFields.maxSpeed !== undefined) qs.maxSpeed = additionalFields.maxSpeed;
		if (additionalFields.ticker_exchange) qs.ticker_exchange = additionalFields.ticker_exchange;
		if (additionalFields.timeoutMS !== undefined) qs.timeoutMS = additionalFields.timeoutMS;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/brand/retrieve-by-ticker`,
			qs,
		})) as IDataObject;
	} else if (operation === 'getByIsin') {
		const isin = this.getNodeParameter('isin', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			force_language?: string;
			maxSpeed?: boolean;
			timeoutMS?: number;
		};
		const qs: IDataObject = { isin };
		if (additionalFields.force_language) qs.force_language = additionalFields.force_language;
		if (additionalFields.maxSpeed !== undefined) qs.maxSpeed = additionalFields.maxSpeed;
		if (additionalFields.timeoutMS !== undefined) qs.timeoutMS = additionalFields.timeoutMS;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/brand/retrieve-by-isin`,
			qs,
		})) as IDataObject;
	} else if (operation === 'extractFonts') {
		const domain = this.getNodeParameter('domain', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			timeoutMS?: number;
		};
		const qs: IDataObject = { domain };
		if (additionalFields.timeoutMS !== undefined) qs.timeoutMS = additionalFields.timeoutMS;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/brand/fonts`,
			qs,
		})) as IDataObject;
	} else if (operation === 'extractStyleguide') {
		// domain is required in the UI; directUrl in Additional Fields overrides it when set
		const domain = this.getNodeParameter('domain', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			directUrl?: string;
			prioritize?: string;
			timeoutMS?: number;
		};
		const qs: IDataObject = additionalFields.directUrl
			? { directUrl: additionalFields.directUrl }
			: { domain };
		if (additionalFields.prioritize) qs.prioritize = additionalFields.prioritize;
		if (additionalFields.timeoutMS !== undefined) qs.timeoutMS = additionalFields.timeoutMS;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/brand/styleguide`,
			qs,
		})) as IDataObject;
	} else if (operation === 'extractProducts') {
		// BRND-08 — AI endpoint — POST with JSON body
		const domain = this.getNodeParameter('domain', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			maxProducts?: number;
			timeoutMS?: number;
		};
		const body: IDataObject = { domain };
		if (additionalFields.maxProducts !== undefined) body.maxProducts = additionalFields.maxProducts;
		if (additionalFields.timeoutMS !== undefined) body.timeoutMS = additionalFields.timeoutMS;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'POST',
			url: `${baseUrl}/brand/ai/products`,
			body,
			json: true,
		})) as IDataObject;
	} else if (operation === 'prefetch') {
		// POST with JSON body — not a GET
		const domain = this.getNodeParameter('domain', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			timeoutMS?: number;
		};
		const body: IDataObject = { domain };
		if (additionalFields.timeoutMS !== undefined) body.timeoutMS = additionalFields.timeoutMS;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'POST',
			url: `${baseUrl}/brand/prefetch`,
			body,
			json: true,
		})) as IDataObject;
	} else if (operation === 'classifyIndustry') {
		const input = this.getNodeParameter('input', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
			maxResults?: number;
			minResults?: number;
			timeoutMS?: number;
		};
		const qs: IDataObject = { input };
		if (additionalFields.maxResults !== undefined) qs.maxResults = additionalFields.maxResults;
		if (additionalFields.minResults !== undefined) qs.minResults = additionalFields.minResults;
		if (additionalFields.timeoutMS !== undefined) qs.timeoutMS = additionalFields.timeoutMS;
		response = (await this.helpers.httpRequestWithAuthentication.call(this, 'contextDevApi', {
			method: 'GET',
			url: `${baseUrl}/brand/naics`,
			qs,
		})) as IDataObject;
	} else {
		throw new NodeOperationError(
			this.getNode(),
			`Unknown brand operation: ${operation}`,
			{ itemIndex: i },
		);
	}

	return { json: response, pairedItem: { item: i } };
}
