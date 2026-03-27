![npm version](https://img.shields.io/npm/v/n8n-nodes-context-dev)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![n8n community node](https://img.shields.io/badge/n8n-community%20node-ff6d5a)
![Context.dev](https://img.shields.io/badge/Context.dev-API-000000)

# n8n-nodes-context-dev

An [n8n](https://n8n.io) community node for the [Context.dev](https://context.dev) API. Wraps the full Context.dev REST API to bring web scraping, brand intelligence, AI extraction, logo retrieval, screenshot capture, and transaction matching into your n8n workflows — no code required.

**21+ operations** across 6 resources, with full parameter support via Additional Fields.

## Installation

In your n8n instance, go to **Settings > Community Nodes** and install:

```
n8n-nodes-context-dev
```

Or install manually from the n8n root directory:

```bash
npm install n8n-nodes-context-dev
```

Then restart n8n.

## Credentials

1. Sign up for a free account at [context.dev](https://context.dev) and copy your API key from the dashboard.
2. In n8n, open **Credentials** and create a new credential of type **Context.dev API**.
3. Paste your API key into the **API Key** field.
4. Leave **Base URL** at the default (`https://api.context.dev`) unless you use a staging or self-hosted environment.
5. *(Optional)* If you plan to use the **Logo Link** resource, enter your Logo Link Client ID (available from the Context.dev dashboard under Logo Link settings).
6. Click **Test connection** to verify. A successful test confirms your API key is valid.

## Resources and Operations

### Web (1 credit per call)

| Operation | Description |
|-----------|-------------|
| Scrape to Markdown | Convert any URL to clean Markdown |
| Scrape to HTML | Get the rendered HTML of a URL |
| Extract Images | List all images found on a URL |
| Crawl Sitemap | Parse a sitemap and return all URLs |

### Brand (10 credits per call)

| Operation | Description |
|-----------|-------------|
| Get by Domain | Full brand profile by domain |
| Get by Email | Brand lookup by email address |
| Get by Company Name | Brand lookup by company name |
| Get by Stock Ticker | Brand lookup by stock ticker symbol |
| Get by ISIN | Brand lookup by ISIN code |
| Extract Colors | Website color palette extraction |
| Extract Fonts | Website font detection |
| Extract Styleguide | Full styleguide (colors, fonts, logos) |
| Extract Products | Product detection via AI (10+ credits) |
| Classify Industry (NAICS) | Company industry classification |
| Prefetch | Warm the cache for a domain (**0 credits**) |

### AI Extraction (10+ credits per call)

| Operation | Description |
|-----------|-------------|
| AI Query | Extract structured data from a domain using natural language |
| Extract Single Product | AI-powered single product extraction |
| Extract Brand Products | AI-powered bulk product extraction |

### Logo Link (0 credits — CDN)

| Operation | Description |
|-----------|-------------|
| Get Logo | Download a brand logo as binary image data |

### Screenshot (1 credit per call)

| Operation | Description |
|-----------|-------------|
| Take Screenshot | Capture viewport or full-page PNG of a URL |

### Transaction (1 credit per call)

| Operation | Description |
|-----------|-------------|
| Match Transaction | Identify the brand behind a bank transaction descriptor |

## Usage Examples

### Web — Scrape a page to Markdown

1. Add a **Context.dev** node to your workflow.
2. Select resource **Web**, operation **Scrape to Markdown**.
3. Set **URL** to `https://example.com`.
4. *(Optional)* Open **Additional Fields** to toggle Include Links or Include Images.
5. The output field `json.markdown` contains the scraped text.

### Brand — Look up a brand by domain

1. Select resource **Brand**, operation **Get by Domain**.
2. Set **Domain** to `stripe.com`.
3. The output contains the full brand profile. Access `json.brand.colors` for the color palette or `json.brand.logo` for the logo URL.

### AI Extraction — Run a custom AI query

1. Select resource **AI Extraction**, operation **AI Query**.
2. Set **Domain** to `apple.com`.
3. Click **Add Datapoint** under **Data to Extract** and add a datapoint with Key `founded_year`, Description `Year the company was founded`, and Type `number`.
4. The output contains `json.results` with the extracted values.

### Logo Link — Download a brand logo

*Prerequisite: Add your Logo Link Client ID to the Context.dev API credential.*

1. Select resource **Logo Link**, operation **Get Logo**.
2. Set **Domain** to `github.com`.
3. The output has a `binary.data` field with the logo image. Connect a **Write Binary File** or **S3** node to store it.

### Screenshot — Capture a full-page screenshot

1. Select resource **Screenshot**, operation **Take Screenshot**.
2. Set **Domain** to `n8n.io`.
3. *(Optional)* Open **Additional Fields** and set **Full Page** to `true`.
4. The output has `binary.data` (PNG image) and `json` metadata. Connect a **Write Binary File** node to save it.

### Transaction — Match a transaction descriptor

1. Select resource **Transaction**, operation **Match Transaction**.
2. Set **Descriptor** to `AMZN Mktp US*AB12345`.
3. The output contains `json.brand` with the matched merchant's name, logo, and domain.

## Compatibility

- **n8n version:** 1.0 or later
- **Node.js:** 18+
- **Context.dev API:** v1

## Links

- [Context.dev API documentation](https://docs.context.dev)
- [Context.dev pricing](https://context.dev/pricing)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE.md)
