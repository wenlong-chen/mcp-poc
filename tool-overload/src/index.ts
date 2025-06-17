import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Jerry Car Insurance Tools - Base set of functions
const generateCarInsuranceTools = (count: number): OpenAI.Chat.Completions.ChatCompletionTool[] => {
  const baseTools = [
    {
      type: "function" as const,
      function: {
        name: "get_quote",
        description: "Get a car insurance quote for a customer",
        parameters: {
          type: "object",
          properties: {
            age: { type: "number", description: "Driver's age" },
            vehicle_year: { type: "number", description: "Vehicle year" },
            vehicle_make: { type: "string", description: "Vehicle make" },
            zip_code: { type: "string", description: "Customer's zip code" }
          },
          required: ["age", "vehicle_year", "vehicle_make", "zip_code"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "check_coverage",
        description: "Check existing coverage details for a policy",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" }
          },
          required: ["policy_number"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "file_claim",
        description: "File a new insurance claim",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            incident_type: { type: "string", description: "Type of incident (accident, theft, etc.)" },
            description: { type: "string", description: "Claim description" }
          },
          required: ["policy_number", "incident_type", "description"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "update_payment_method",
        description: "Update customer's payment method",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            payment_type: { type: "string", description: "Payment method type" }
          },
          required: ["policy_number", "payment_type"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "get_discounts",
        description: "Get available discounts for a customer",
        parameters: {
          type: "object",
          properties: {
            customer_id: { type: "string", description: "Customer ID" }
          },
          required: ["customer_id"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "schedule_inspection",
        description: "Schedule vehicle inspection",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            preferred_date: { type: "string", description: "Preferred inspection date" }
          },
          required: ["policy_number", "preferred_date"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "get_claim_status",
        description: "Check the status of an existing claim",
        parameters: {
          type: "object",
          properties: {
            claim_number: { type: "string", description: "Claim number" }
          },
          required: ["claim_number"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "add_driver",
        description: "Add a new driver to the policy",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            driver_name: { type: "string", description: "Driver's full name" },
            driver_age: { type: "number", description: "Driver's age" },
            license_number: { type: "string", description: "Driver's license number" }
          },
          required: ["policy_number", "driver_name", "driver_age", "license_number"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "remove_driver",
        description: "Remove a driver from the policy",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            driver_id: { type: "string", description: "Driver ID to remove" }
          },
          required: ["policy_number", "driver_id"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "update_vehicle_info",
        description: "Update vehicle information",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            vehicle_id: { type: "string", description: "Vehicle ID" },
            mileage: { type: "number", description: "Current mileage" }
          },
          required: ["policy_number", "vehicle_id", "mileage"]
        }
      }
    }
  ];

  // Generate additional tools to reach the desired count
  const additionalTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
  for (let i = baseTools.length; i < count; i++) {
    additionalTools.push({
      type: "function" as const,
      function: {
        name: `insurance_function_${i + 1}`,
        description: `Jerry insurance operation ${i + 1} - handles specialized car insurance task`,
        parameters: {
          type: "object",
          properties: {
            operation_id: { type: "string", description: "Operation identifier" },
            data: { type: "string", description: "Operation data" }
          },
          required: ["operation_id"]
        }
      }
    });
  }

  return [...baseTools, ...additionalTools];
};

// Test scenarios for Jerry's car insurance business
const testScenarios = [
  {
    prompt: "I need a car insurance quote for my 2020 Honda Civic. I'm 28 years old and live in zip code 90210.",
    expectedTool: "get_quote"
  },
  {
    prompt: "Can you check my coverage details? My policy number is POL123456.",
    expectedTool: "check_coverage"
  },
  {
    prompt: "I need to file a claim for an accident. My policy number is POL789012 and it was a rear-end collision on the highway.",
    expectedTool: "file_claim"
  },
  {
    prompt: "I want to add my teenage son to my car insurance policy POL345678. His name is John Smith, he's 17 years old, and his license number is DL987654.",
    expectedTool: "add_driver"
  },
  {
    prompt: "What discounts are available for customer ID CUST001?",
    expectedTool: "get_discounts"
  }
];

interface TestResult {
  toolCount: number;
  scenario: string;
  expectedTool: string;
  actualTool: string | null;
  success: boolean;
  responseTime: number;
  error?: string;
}

async function runTest(toolCount: number, scenario: any): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const tools = generateCarInsuranceTools(toolCount);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4.1", // Using GPT-4 Turbo
      messages: [
        {
          role: "system",
          content: "You are Jerry, an AI assistant for car insurance. Use the provided tools to help customers with their insurance needs. Always call the most appropriate tool for the user's request."
        },
        {
          role: "user",
          content: scenario.prompt
        }
      ],
      tools: tools,
      tool_choice: "auto"
    });

    const responseTime = Date.now() - startTime;
    const toolCalls = response.choices[0]?.message?.tool_calls;
    
    if (!toolCalls || toolCalls.length === 0) {
      return {
        toolCount,
        scenario: scenario.prompt,
        expectedTool: scenario.expectedTool,
        actualTool: null,
        success: false,
        responseTime,
        error: "No tool called"
      };
    }

    const actualTool = toolCalls[0].function.name;
    const success = actualTool === scenario.expectedTool;

    return {
      toolCount,
      scenario: scenario.prompt,
      expectedTool: scenario.expectedTool,
      actualTool,
      success,
      responseTime
    };

  } catch (error) {
    return {
      toolCount,
      scenario: scenario.prompt,
      expectedTool: scenario.expectedTool,
      actualTool: null,
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function runToolOverloadTest() {
  console.log("🚗 Jerry Car Insurance Tool Overload Test");
  console.log("==========================================");
  
  const results: TestResult[] = [];
  const toolCounts = [10, 15, 20, 25, 30, 35, 40, 45, 50];

  for (const toolCount of toolCounts) {
    console.log(`\n📊 Testing with ${toolCount} tools...`);
    
    for (const scenario of testScenarios) {
      console.log(`  - Running scenario: "${scenario.prompt.substring(0, 50)}..."`);
      
      const result = await runTest(toolCount, scenario);
      results.push(result);
      
      if (result.success) {
        console.log(`    ✅ Success: Called ${result.actualTool} (${result.responseTime}ms)`);
      } else {
        console.log(`    ❌ Failed: Expected ${result.expectedTool}, got ${result.actualTool || 'none'} (${result.responseTime}ms)`);
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
      }
      
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Analyze results
  console.log("\n📈 Analysis Results");
  console.log("===================");
  
  const successRateByToolCount: { [key: number]: number } = {};
  const avgResponseTimeByToolCount: { [key: number]: number } = {};

  for (const toolCount of toolCounts) {
    const resultsForCount = results.filter(r => r.toolCount === toolCount);
    const successCount = resultsForCount.filter(r => r.success).length;
    const successRate = (successCount / resultsForCount.length) * 100;
    const avgResponseTime = resultsForCount.reduce((sum, r) => sum + r.responseTime, 0) / resultsForCount.length;
    
    successRateByToolCount[toolCount] = successRate;
    avgResponseTimeByToolCount[toolCount] = avgResponseTime;
    
    console.log(`${toolCount} tools: ${successRate.toFixed(1)}% success rate, ${avgResponseTime.toFixed(0)}ms avg response time`);
  }

  // Find degradation point
  const degradationThreshold = 80; // Consider degradation when success rate drops below 80%
  const degradationPoint = toolCounts.find(count => successRateByToolCount[count] < degradationThreshold);
  
  if (degradationPoint) {
    console.log(`\n⚠️  Tool calling starts to degrade at ${degradationPoint} tools`);
  } else {
    console.log(`\n✅ Tool calling remains reliable up to ${Math.max(...toolCounts)} tools`);
  }

  // Export detailed results
  console.log("\n📋 Detailed Results:");
  console.table(results.map(r => ({
    Tools: r.toolCount,
    Scenario: r.scenario.substring(0, 30) + "...",
    Expected: r.expectedTool,
    Actual: r.actualTool || "none",
    Success: r.success ? "✅" : "❌",
    "Time(ms)": r.responseTime
  })));
}

// Run the test
if (require.main === module) {
  runToolOverloadTest().catch(console.error);
} 