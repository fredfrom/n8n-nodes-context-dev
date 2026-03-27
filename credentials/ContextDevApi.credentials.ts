import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ContextDevApi implements ICredentialType {
  name = 'contextDevApi';
  displayName = 'Context.dev API';
  documentationUrl = 'https://docs.context.dev';
  icon = 'file:contextdev.svg' as const;

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.context.dev',
      description: 'Override for staging or self-hosted environments. Do not include /v1 suffix.',
    },
    {
      displayName: 'Logo Link Client ID',
      name: 'logoLinkClientId',
      type: 'string',
      default: '',
      description: 'Client ID for Logo Link CDN operations. Required only for Logo Link resource.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials?.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/v1/brand/retrieve-simplified',
      method: 'GET',
      qs: { domain: 'n8n.io' },
    },
  };
}
