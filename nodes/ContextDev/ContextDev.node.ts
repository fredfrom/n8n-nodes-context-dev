import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { webProperties, executeWebOperation } from './descriptions/WebDescription';
import { screenshotProperties, executeScreenshotOperation } from './descriptions/ScreenshotDescription';
import { brandProperties, executeBrandOperation } from './descriptions/BrandDescription';
import { transactionProperties, executeTransactionOperation } from './descriptions/TransactionDescription';
import { aiProperties, executeAiOperation } from './descriptions/AiDescription';
import { logoLinkProperties, executeLogoLinkOperation } from './descriptions/LogoLinkDescription';

export class ContextDev implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Context.dev',
		name: 'contextDev',
		icon: { light: 'file:contextdev.svg', dark: 'file:contextdev.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["resource"] + ": " + $parameter["operation"] }}',
		description: 'Web scraping, brand intelligence, and transaction enrichment via Context.dev',
		defaults: { name: 'Context.dev' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'contextDevApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'AI Extraction', value: 'aiExtraction' },
					{ name: 'Brand', value: 'brand' },
					{ name: 'Logo Link', value: 'logoLink' },
					{ name: 'Screenshot', value: 'screenshot' },
					{ name: 'Transaction', value: 'transaction' },
					{ name: 'Web', value: 'web' },
				],
				default: 'web',
			},
			...webProperties,
			...screenshotProperties,
			...brandProperties,
			...transactionProperties,
			...aiProperties,
			...logoLinkProperties,
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Read credentials and build baseUrl once — not inside the item loop
		const credentials = await this.getCredentials('contextDevApi');
		const baseUrl = `${(credentials.baseUrl as string).replace(/\/$/, '')}/v1`;

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: INodeExecutionData;

				if (resource === 'web') {
					responseData = await executeWebOperation.call(this, operation, i, baseUrl);
				} else if (resource === 'screenshot') {
					responseData = await executeScreenshotOperation.call(this, operation, i, baseUrl);
				} else if (resource === 'brand') {
					responseData = await executeBrandOperation.call(this, operation, i, baseUrl);
				} else if (resource === 'transaction') {
					responseData = await executeTransactionOperation.call(this, operation, i, baseUrl);
				} else if (resource === 'aiExtraction') {
					responseData = await executeAiOperation.call(this, operation, i, baseUrl);
				} else if (resource === 'logoLink') {
					responseData = await executeLogoLinkOperation.call(this, operation, i, baseUrl);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
				}

				returnData.push(responseData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				if ((error as { context?: unknown }).context) {
					(error as { context: { itemIndex: number } }).context.itemIndex = i;
					throw error;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
