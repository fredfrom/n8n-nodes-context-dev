import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const transactionProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
			},
		},
		options: [
			{
				name: 'Identify Brand',
				value: 'identifyBrand',
				action: 'Match a transaction descriptor to a brand',
			},
		],
		default: 'identifyBrand',
	},
	{
		displayName: 'Transaction Info',
		name: 'transaction_info',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['identifyBrand'],
			},
		},
		description: 'Transaction descriptor string (e.g. AMZN MKTP US*123)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['identifyBrand'],
			},
		},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City where the transaction occurred — improves match accuracy',
			},
			{
				displayName: 'Country Code',
				name: 'country_gl',
				type: 'string',
				default: '',
				description: 'Two-letter country code (e.g. US, DE)',
			},
			{
				displayName: 'Force Language',
				name: 'force_language',
				type: 'string',
				default: '',
				description: 'Language code for response (e.g. en, de)',
			},
			{
				displayName: 'High Confidence Only',
				name: 'high_confidence_only',
				type: 'boolean',
				default: false,
				description: 'Whether to return null when confidence is low instead of a best-guess match',
			},
			{
				displayName: 'Max Speed',
				name: 'maxSpeed',
				type: 'boolean',
				default: false,
				description: 'Whether to skip slower AI enrichments for faster response',
			},
			{
				displayName: 'MCC',
				name: 'mcc',
				type: 'string',
				default: '',
				description: 'Merchant Category Code for improved classification',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number on the transaction',
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

export async function executeTransactionOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
	baseUrl: string,
): Promise<INodeExecutionData> {
	if (operation !== 'identifyBrand') {
		throw new NodeOperationError(this.getNode(), `Unknown transaction operation: ${operation}`, { itemIndex: i });
	}

	const transaction_info = this.getNodeParameter('transaction_info', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
		city?: string;
		country_gl?: string;
		force_language?: string;
		high_confidence_only?: boolean;
		maxSpeed?: boolean;
		mcc?: string;
		phone?: string;
		timeoutMS?: number;
	};

	const qs: IDataObject = { transaction_info };
	if (additionalFields.city) qs.city = additionalFields.city;
	if (additionalFields.country_gl) qs.country_gl = additionalFields.country_gl;
	if (additionalFields.force_language) qs.force_language = additionalFields.force_language;
	if (additionalFields.high_confidence_only !== undefined) qs.high_confidence_only = additionalFields.high_confidence_only;
	if (additionalFields.maxSpeed !== undefined) qs.maxSpeed = additionalFields.maxSpeed;
	if (additionalFields.mcc) qs.mcc = additionalFields.mcc;
	if (additionalFields.phone) qs.phone = additionalFields.phone;
	if (additionalFields.timeoutMS !== undefined) qs.timeoutMS = additionalFields.timeoutMS;

	const response = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'contextDevApi',
		{ method: 'GET', url: `${baseUrl}/brand/transaction_identifier`, qs },
	)) as IDataObject;

	return { json: response, pairedItem: { item: i } };
}
