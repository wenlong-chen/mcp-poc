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
npm run test
```

## What it tests

The script tests GPT-4.1's tool calling accuracy with:
- **Tool counts**: 10, 20, 30, 40, 50, 100 realistic insurance business tools
- **Tool placement**: Essential tools at start/middle/end positions
- **Business scenarios**: Quote requests, coverage checks, claim filing, driver management, etc.
- **System prompt**: Complex Jerry real-world business system prompt
- **Metrics**: Success rate, response time, degradation point

## Test scenarios

1. Car insurance quote request (with age, vehicle details, zip code)
2. Coverage details check (with policy number)
3. Accident claim filing (with policy number and incident details)
4. Adding driver to policy (with complete driver information)
5. Getting available discounts (with customer ID)
6. Updating payment method (with policy information)
7. Scheduling vehicle inspection (with policy and time preference)
8. Checking claim status (with claim number)
9. Removing driver from policy (with driver ID)
10. Updating vehicle information (with mileage details)

## Tool Set

Contains 100 meaningful car insurance tools covering:
- Quote and pricing functions (get_quote, get_instant_quote, calculate_quote, etc.)
- Coverage check functions (check_coverage, verify_coverage, assess_coverage, etc.)
- Claims processing functions (file_claim, track_claim, get_claim_status, etc.)
- Driver management functions (add_driver, remove_driver, register_driver, etc.)
- Payment processing functions (update_payment_method, process_payment, etc.)
- Discount management functions (get_discounts, apply_discounts, etc.)
- Vehicle management functions (update_vehicle_info, add_vehicle, etc.)
- Inspection scheduling functions (schedule_inspection, book_inspection, etc.)
- Policy management and other customer service functions

## Tool Placement Testing

Tests the impact of placing essential tools at different positions in the tool list:
- **Start position**: Essential tools at the beginning of the tool list
- **Middle position**: Essential tools in the middle of the tool list
- **End position**: Essential tools at the end of the tool list

## Output Results

The script will output:
- Success/failure for each scenario
- Success rate grouped by tool count and placement position
- Average response time
- Point where tool calling starts to degrade
- Detailed results table showing actual vs requested tool counts

## Expected behavior

The test helps identify at what point OpenAI's tool calling becomes unreliable as the number of available tools increases and when tool positions change, providing insights for real-world business scenarios.
