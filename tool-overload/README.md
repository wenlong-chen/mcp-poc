# OpenAI Tool Overload Test

A TypeScript script to test OpenAI's tool calling capabilities with increasing numbers of tools, using Jerry's car insurance business functions as examples.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your OpenAI API key:
```bash
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

3. Run the test:
```bash
npm run dev
```

## What it tests

The script tests GPT-4.1's tool calling accuracy with:
- **Tool counts**: 10, 15, 20, 25, 30, 35, 40, 45, 50 tools
- **Car insurance scenarios**: Quote requests, coverage checks, claim filing, driver management, etc.
- **Metrics**: Success rate, response time, degradation point

## Test scenarios

1. Car insurance quote request
2. Coverage details check
3. Claim filing
4. Adding driver to policy
5. Getting available discounts

The script will output:
- Success/failure for each scenario
- Success rate by tool count
- Average response time
- Point where tool calling starts to degrade
- Detailed results table

## Expected behavior

The test helps identify at what point OpenAI's tool calling becomes unreliable as the number of available tools increases.
