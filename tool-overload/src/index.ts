import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Comprehensive Jerry Car Insurance Tools - All meaningful functions
const generateCarInsuranceTools = (count: number, toolPlacement: 'start' | 'middle' | 'end' = 'start'): OpenAI.Chat.Completions.ChatCompletionTool[] => {
  const allTools = [
    // Quote and pricing functions
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
        name: "get_instant_quote",
        description: "Get an instant car insurance quote with basic information",
        parameters: {
          type: "object",
          properties: {
            vehicle_type: { type: "string", description: "Type of vehicle" },
            zip_code: { type: "string", description: "Customer's zip code" }
          },
          required: ["vehicle_type", "zip_code"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "get_premium_quote",
        description: "Get a premium insurance quote with comprehensive coverage",
        parameters: {
          type: "object",
          properties: {
            customer_id: { type: "string", description: "Customer ID" },
            coverage_level: { type: "string", description: "Desired coverage level" }
          },
          required: ["customer_id", "coverage_level"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "calculate_quote",
        description: "Calculate insurance quote based on risk factors",
        parameters: {
          type: "object",
          properties: {
            risk_score: { type: "number", description: "Customer risk score" },
            vehicle_value: { type: "number", description: "Vehicle estimated value" }
          },
          required: ["risk_score", "vehicle_value"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "estimate_quote",
        description: "Provide a rough insurance quote estimate",
        parameters: {
          type: "object",
          properties: {
            driver_profile: { type: "string", description: "Driver profile summary" }
          },
          required: ["driver_profile"]
        }
      }
    },

    // Coverage functions
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
        name: "verify_coverage",
        description: "Verify current insurance coverage status",
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
        name: "review_coverage",
        description: "Review and analyze current coverage options",
        parameters: {
          type: "object",
          properties: {
            policy_id: { type: "string", description: "Policy ID" }
          },
          required: ["policy_id"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "validate_coverage",
        description: "Validate insurance coverage meets requirements",
        parameters: {
          type: "object",
          properties: {
            coverage_type: { type: "string", description: "Type of coverage to validate" }
          },
          required: ["coverage_type"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "assess_coverage",
        description: "Assess adequacy of current insurance coverage",
        parameters: {
          type: "object",
          properties: {
            customer_needs: { type: "string", description: "Customer's insurance needs" }
          },
          required: ["customer_needs"]
        }
      }
    },

    // Claims functions
    {
      type: "function" as const,
      function: {
        name: "file_claim",
        description: "File a new insurance claim",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            incident_type: { type: "string", description: "Type of incident" },
            description: { type: "string", description: "Claim description" }
          },
          required: ["policy_number", "incident_type", "description"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "submit_claim",
        description: "Submit an insurance claim for processing",
        parameters: {
          type: "object",
          properties: {
            claim_details: { type: "string", description: "Detailed claim information" }
          },
          required: ["claim_details"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "process_claim",
        description: "Process an existing insurance claim",
        parameters: {
          type: "object",
          properties: {
            claim_id: { type: "string", description: "Claim ID to process" }
          },
          required: ["claim_id"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "track_claim",
        description: "Track the progress of an insurance claim",
        parameters: {
          type: "object",
          properties: {
            claim_number: { type: "string", description: "Claim tracking number" }
          },
          required: ["claim_number"]
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
        name: "update_claim",
        description: "Update information for an existing claim",
        parameters: {
          type: "object",
          properties: {
            claim_id: { type: "string", description: "Claim ID" },
            update_info: { type: "string", description: "Updated information" }
          },
          required: ["claim_id", "update_info"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "close_claim",
        description: "Close a completed insurance claim",
        parameters: {
          type: "object",
          properties: {
            claim_number: { type: "string", description: "Claim number to close" }
          },
          required: ["claim_number"]
        }
      }
    },

    // Driver management functions
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
        name: "register_driver",
        description: "Register a new driver in the system",
        parameters: {
          type: "object",
          properties: {
            driver_info: { type: "string", description: "Complete driver information" }
          },
          required: ["driver_info"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "enroll_driver",
        description: "Enroll a driver for insurance coverage",
        parameters: {
          type: "object",
          properties: {
            policy_id: { type: "string", description: "Policy ID" },
            driver_details: { type: "string", description: "Driver enrollment details" }
          },
          required: ["policy_id", "driver_details"]
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
        name: "delete_driver",
        description: "Delete a driver from the insurance policy",
        parameters: {
          type: "object",
          properties: {
            driver_reference: { type: "string", description: "Driver reference ID" }
          },
          required: ["driver_reference"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "exclude_driver",
        description: "Exclude a driver from policy coverage",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            driver_name: { type: "string", description: "Driver name to exclude" }
          },
          required: ["policy_number", "driver_name"]
        }
      }
    },

    // Payment functions
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
        name: "change_payment_method",
        description: "Change the current payment method for policy",
        parameters: {
          type: "object",
          properties: {
            account_id: { type: "string", description: "Customer account ID" },
            new_payment_info: { type: "string", description: "New payment information" }
          },
          required: ["account_id", "new_payment_info"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "set_payment_method",
        description: "Set up a new payment method for insurance payments",
        parameters: {
          type: "object",
          properties: {
            customer_id: { type: "string", description: "Customer ID" },
            payment_details: { type: "string", description: "Payment method details" }
          },
          required: ["customer_id", "payment_details"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "process_payment",
        description: "Process an insurance premium payment",
        parameters: {
          type: "object",
          properties: {
            payment_amount: { type: "number", description: "Payment amount" },
            policy_reference: { type: "string", description: "Policy reference" }
          },
          required: ["payment_amount", "policy_reference"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "schedule_payment",
        description: "Schedule automatic insurance payments",
        parameters: {
          type: "object",
          properties: {
            policy_id: { type: "string", description: "Policy ID" },
            payment_schedule: { type: "string", description: "Payment schedule details" }
          },
          required: ["policy_id", "payment_schedule"]
        }
      }
    },

    // Discount functions
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
        name: "check_discounts",
        description: "Check what discounts a customer qualifies for",
        parameters: {
          type: "object",
          properties: {
            policy_details: { type: "string", description: "Policy details for discount check" }
          },
          required: ["policy_details"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "apply_discounts",
        description: "Apply eligible discounts to a policy",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            discount_codes: { type: "string", description: "Discount codes to apply" }
          },
          required: ["policy_number", "discount_codes"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "calculate_discounts",
        description: "Calculate potential savings from available discounts",
        parameters: {
          type: "object",
          properties: {
            base_premium: { type: "number", description: "Base premium amount" },
            customer_profile: { type: "string", description: "Customer profile" }
          },
          required: ["base_premium", "customer_profile"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "find_discounts",
        description: "Find all applicable discounts for a customer",
        parameters: {
          type: "object",
          properties: {
            customer_info: { type: "string", description: "Customer information for discount search" }
          },
          required: ["customer_info"]
        }
      }
    },

    // Vehicle functions
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
    },
    {
      type: "function" as const,
      function: {
        name: "add_vehicle",
        description: "Add a new vehicle to the policy",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            vehicle_details: { type: "string", description: "Complete vehicle information" }
          },
          required: ["policy_number", "vehicle_details"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "remove_vehicle",
        description: "Remove a vehicle from insurance coverage",
        parameters: {
          type: "object",
          properties: {
            vehicle_id: { type: "string", description: "Vehicle ID to remove" }
          },
          required: ["vehicle_id"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "register_vehicle",
        description: "Register a new vehicle for insurance",
        parameters: {
          type: "object",
          properties: {
            vin_number: { type: "string", description: "Vehicle VIN number" },
            owner_info: { type: "string", description: "Owner information" }
          },
          required: ["vin_number", "owner_info"]
        }
      }
    },

    // Inspection functions
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
        name: "book_inspection",
        description: "Book an appointment for vehicle inspection",
        parameters: {
          type: "object",
          properties: {
            vehicle_info: { type: "string", description: "Vehicle information" },
            appointment_time: { type: "string", description: "Preferred appointment time" }
          },
          required: ["vehicle_info", "appointment_time"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "arrange_inspection",
        description: "Arrange a professional vehicle inspection",
        parameters: {
          type: "object",
          properties: {
            policy_id: { type: "string", description: "Policy ID" },
            inspection_type: { type: "string", description: "Type of inspection needed" }
          },
          required: ["policy_id", "inspection_type"]
        }
      }
    },

    // Policy management functions
    {
      type: "function" as const,
      function: {
        name: "create_policy",
        description: "Create a new insurance policy",
        parameters: {
          type: "object",
          properties: {
            customer_details: { type: "string", description: "Customer information" },
            coverage_options: { type: "string", description: "Selected coverage options" }
          },
          required: ["customer_details", "coverage_options"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "modify_policy",
        description: "Modify an existing insurance policy",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            changes: { type: "string", description: "Policy changes requested" }
          },
          required: ["policy_number", "changes"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "cancel_policy",
        description: "Cancel an insurance policy",
        parameters: {
          type: "object",
          properties: {
            policy_id: { type: "string", description: "Policy ID to cancel" },
            cancellation_reason: { type: "string", description: "Reason for cancellation" }
          },
          required: ["policy_id", "cancellation_reason"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "renew_policy",
        description: "Renew an expiring insurance policy",
        parameters: {
          type: "object",
          properties: {
            policy_reference: { type: "string", description: "Policy reference number" }
          },
          required: ["policy_reference"]
        }
      }
    },

    // Additional customer service functions
    {
      type: "function" as const,
      function: {
        name: "get_policy_documents",
        description: "Retrieve policy documents for customer",
        parameters: {
          type: "object",
          properties: {
            policy_number: { type: "string", description: "Policy number" },
            document_type: { type: "string", description: "Type of document requested" }
          },
          required: ["policy_number", "document_type"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "update_contact_info",
        description: "Update customer contact information",
        parameters: {
          type: "object",
          properties: {
            customer_id: { type: "string", description: "Customer ID" },
            contact_details: { type: "string", description: "New contact information" }
          },
          required: ["customer_id", "contact_details"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "request_callback",
        description: "Request a callback from customer service",
        parameters: {
          type: "object",
          properties: {
            customer_phone: { type: "string", description: "Customer phone number" },
            preferred_time: { type: "string", description: "Preferred callback time" }
          },
          required: ["customer_phone", "preferred_time"]
        }
      }
    },
         {
       type: "function" as const,
       function: {
         name: "get_roadside_assistance",
         description: "Request roadside assistance service",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             location: { type: "string", description: "Current location" },
             issue_type: { type: "string", description: "Type of roadside issue" }
           },
           required: ["policy_number", "location", "issue_type"]
         }
       }
     },

     // Additional functions to reach 50+ tools
     {
       type: "function" as const,
       function: {
         name: "calculate_deductible",
         description: "Calculate deductible amount for a claim",
         parameters: {
           type: "object",
           properties: {
             claim_type: { type: "string", description: "Type of claim" },
             policy_number: { type: "string", description: "Policy number" }
           },
           required: ["claim_type", "policy_number"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "estimate_repair_cost",
         description: "Estimate vehicle repair costs for insurance purposes",
         parameters: {
           type: "object",
           properties: {
             damage_description: { type: "string", description: "Description of vehicle damage" },
             vehicle_info: { type: "string", description: "Vehicle information" }
           },
           required: ["damage_description", "vehicle_info"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "validate_license",
         description: "Validate driver's license information",
         parameters: {
           type: "object",
           properties: {
             license_number: { type: "string", description: "Driver's license number" },
             state: { type: "string", description: "State of license issuance" }
           },
           required: ["license_number", "state"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_accident_report",
         description: "Retrieve accident report details",
         parameters: {
           type: "object",
           properties: {
             report_number: { type: "string", description: "Police report number" },
             date: { type: "string", description: "Date of accident" }
           },
           required: ["report_number", "date"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "schedule_adjuster_visit",
         description: "Schedule insurance adjuster visit for claim assessment",
         parameters: {
           type: "object",
           properties: {
             claim_number: { type: "string", description: "Claim number" },
             preferred_date: { type: "string", description: "Preferred visit date" },
             contact_info: { type: "string", description: "Contact information" }
           },
           required: ["claim_number", "preferred_date", "contact_info"]
         }
       }
     },

     // Additional functions to reach 100 tools
     {
       type: "function" as const,
       function: {
         name: "get_premium_history",
         description: "Get customer's premium payment history",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             months: { type: "number", description: "Number of months to retrieve" }
           },
           required: ["policy_number", "months"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "calculate_penalty",
         description: "Calculate penalty for late payment or policy violation",
         parameters: {
           type: "object",
           properties: {
             violation_type: { type: "string", description: "Type of violation" },
             policy_id: { type: "string", description: "Policy ID" }
           },
           required: ["violation_type", "policy_id"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "verify_identity",
         description: "Verify customer identity for security purposes",
         parameters: {
           type: "object",
           properties: {
             customer_id: { type: "string", description: "Customer ID" },
             verification_method: { type: "string", description: "Method of verification" }
           },
           required: ["customer_id", "verification_method"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "generate_certificate",
         description: "Generate insurance certificate for customer",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             certificate_type: { type: "string", description: "Type of certificate needed" }
           },
           required: ["policy_number", "certificate_type"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "check_fraud_indicators",
         description: "Check for potential fraud indicators in claims or applications",
         parameters: {
           type: "object",
           properties: {
             reference_id: { type: "string", description: "Reference ID to check" },
             check_type: { type: "string", description: "Type of fraud check" }
           },
           required: ["reference_id", "check_type"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "update_risk_profile",
         description: "Update customer's risk profile based on new information",
         parameters: {
           type: "object",
           properties: {
             customer_id: { type: "string", description: "Customer ID" },
             risk_factors: { type: "string", description: "New risk factors" }
           },
           required: ["customer_id", "risk_factors"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_competitor_rates",
         description: "Get competitor insurance rates for comparison",
         parameters: {
           type: "object",
           properties: {
             coverage_specs: { type: "string", description: "Coverage specifications" },
             location: { type: "string", description: "Customer location" }
           },
           required: ["coverage_specs", "location"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "schedule_survey",
         description: "Schedule customer satisfaction survey",
         parameters: {
           type: "object",
           properties: {
             customer_id: { type: "string", description: "Customer ID" },
             survey_type: { type: "string", description: "Type of survey" }
           },
           required: ["customer_id", "survey_type"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_referral",
         description: "Process customer referral for new business",
         parameters: {
           type: "object",
           properties: {
             referrer_id: { type: "string", description: "Referring customer ID" },
             referee_info: { type: "string", description: "Referred customer information" }
           },
           required: ["referrer_id", "referee_info"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "update_emergency_contact",
         description: "Update emergency contact information",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             contact_details: { type: "string", description: "Emergency contact details" }
           },
           required: ["policy_number", "contact_details"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_repair_shop_network",
         description: "Get list of approved repair shops in customer's area",
         parameters: {
           type: "object",
           properties: {
             zip_code: { type: "string", description: "Customer's zip code" },
             service_type: { type: "string", description: "Type of repair service needed" }
           },
           required: ["zip_code", "service_type"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_glassdoor_claim",
         description: "Process windshield/glass replacement claim",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             damage_details: { type: "string", description: "Glass damage details" }
           },
           required: ["policy_number", "damage_details"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "validate_vin",
         description: "Validate vehicle identification number",
         parameters: {
           type: "object",
           properties: {
             vin_number: { type: "string", description: "Vehicle identification number" }
           },
           required: ["vin_number"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_weather_impact",
         description: "Get weather impact assessment for claims",
         parameters: {
           type: "object",
           properties: {
             location: { type: "string", description: "Location of incident" },
             date: { type: "string", description: "Date of incident" }
           },
           required: ["location", "date"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "calculate_gap_coverage",
         description: "Calculate gap coverage for financed vehicles",
         parameters: {
           type: "object",
           properties: {
             vehicle_value: { type: "number", description: "Current vehicle value" },
             loan_balance: { type: "number", description: "Outstanding loan balance" }
           },
           required: ["vehicle_value", "loan_balance"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_total_loss",
         description: "Process total loss vehicle claim",
         parameters: {
           type: "object",
           properties: {
             claim_number: { type: "string", description: "Claim number" },
             vehicle_details: { type: "string", description: "Vehicle details" }
           },
           required: ["claim_number", "vehicle_details"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_rental_coverage",
         description: "Get rental car coverage details and availability",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             rental_period: { type: "string", description: "Expected rental period" }
           },
           required: ["policy_number", "rental_period"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "update_mileage_tier",
         description: "Update customer's mileage tier for pricing",
         parameters: {
           type: "object",
           properties: {
             policy_id: { type: "string", description: "Policy ID" },
             annual_mileage: { type: "number", description: "Annual mileage estimate" }
           },
           required: ["policy_id", "annual_mileage"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_multi_vehicle_discount",
         description: "Process multi-vehicle discount application",
         parameters: {
           type: "object",
           properties: {
             customer_id: { type: "string", description: "Customer ID" },
             vehicle_count: { type: "number", description: "Number of vehicles" }
           },
           required: ["customer_id", "vehicle_count"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_telematics_data",
         description: "Get telematics driving data for usage-based insurance",
         parameters: {
           type: "object",
           properties: {
             device_id: { type: "string", description: "Telematics device ID" },
             data_period: { type: "string", description: "Data period to retrieve" }
           },
           required: ["device_id", "data_period"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "calculate_safe_driver_discount",
         description: "Calculate safe driver discount based on driving record",
         parameters: {
           type: "object",
           properties: {
             driver_id: { type: "string", description: "Driver ID" },
             record_period: { type: "string", description: "Period to analyze driving record" }
           },
           required: ["driver_id", "record_period"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_loyalty_discount",
         description: "Process customer loyalty discount",
         parameters: {
           type: "object",
           properties: {
             customer_id: { type: "string", description: "Customer ID" },
             years_with_company: { type: "number", description: "Years as customer" }
           },
           required: ["customer_id", "years_with_company"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_coverage_recommendations",
         description: "Get personalized coverage recommendations for customer",
         parameters: {
           type: "object",
           properties: {
             customer_profile: { type: "string", description: "Customer profile information" },
             current_coverage: { type: "string", description: "Current coverage details" }
           },
           required: ["customer_profile", "current_coverage"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_hardship_program",
         description: "Process application for financial hardship program",
         parameters: {
           type: "object",
           properties: {
             customer_id: { type: "string", description: "Customer ID" },
             hardship_details: { type: "string", description: "Hardship circumstances" }
           },
           required: ["customer_id", "hardship_details"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "validate_coverage_dates",
         description: "Validate coverage effective and expiration dates",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             requested_dates: { type: "string", description: "Requested coverage dates" }
           },
           required: ["policy_number", "requested_dates"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_state_requirements",
         description: "Get state-specific insurance requirements",
         parameters: {
           type: "object",
           properties: {
             state: { type: "string", description: "State abbreviation" },
             vehicle_type: { type: "string", description: "Type of vehicle" }
           },
           required: ["state", "vehicle_type"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_sr22_filing",
         description: "Process SR-22 filing for high-risk drivers",
         parameters: {
           type: "object",
           properties: {
             driver_id: { type: "string", description: "Driver ID" },
             filing_reason: { type: "string", description: "Reason for SR-22 filing" }
           },
           required: ["driver_id", "filing_reason"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "calculate_non_owner_policy",
         description: "Calculate non-owner car insurance policy",
         parameters: {
           type: "object",
           properties: {
             driver_profile: { type: "string", description: "Driver profile" },
             coverage_limits: { type: "string", description: "Desired coverage limits" }
           },
           required: ["driver_profile", "coverage_limits"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_rideshare_coverage",
         description: "Process rideshare driver coverage application",
         parameters: {
           type: "object",
           properties: {
             driver_id: { type: "string", description: "Driver ID" },
             rideshare_company: { type: "string", description: "Rideshare company name" }
           },
           required: ["driver_id", "rideshare_company"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_accident_forgiveness",
         description: "Check accident forgiveness eligibility and benefits",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             accident_date: { type: "string", description: "Date of accident" }
           },
           required: ["policy_number", "accident_date"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_vanishing_deductible",
         description: "Process vanishing deductible program enrollment",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             safe_driving_years: { type: "number", description: "Years of safe driving" }
           },
           required: ["policy_number", "safe_driving_years"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "calculate_new_driver_rates",
         description: "Calculate insurance rates for new/teen drivers",
         parameters: {
           type: "object",
           properties: {
             driver_age: { type: "number", description: "Driver's age" },
             parent_policy: { type: "string", description: "Parent policy number if applicable" }
           },
           required: ["driver_age"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_defensive_driving_credit",
         description: "Process defensive driving course completion credit",
         parameters: {
           type: "object",
           properties: {
             driver_id: { type: "string", description: "Driver ID" },
             course_certificate: { type: "string", description: "Course completion certificate number" }
           },
           required: ["driver_id", "course_certificate"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_claim_adjuster_notes",
         description: "Get adjuster notes and recommendations for claim",
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
         name: "process_salvage_title",
         description: "Process insurance for vehicle with salvage title",
         parameters: {
           type: "object",
           properties: {
             vin_number: { type: "string", description: "Vehicle VIN" },
             inspection_report: { type: "string", description: "Salvage inspection report" }
           },
           required: ["vin_number", "inspection_report"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "calculate_classic_car_coverage",
         description: "Calculate coverage for classic/antique vehicles",
         parameters: {
           type: "object",
           properties: {
             vehicle_details: { type: "string", description: "Classic vehicle details" },
             agreed_value: { type: "number", description: "Agreed upon value" }
           },
           required: ["vehicle_details", "agreed_value"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_modified_vehicle",
         description: "Process insurance for modified/customized vehicles",
         parameters: {
           type: "object",
           properties: {
             base_vehicle: { type: "string", description: "Base vehicle information" },
             modification_details: { type: "string", description: "Vehicle modifications" }
           },
           required: ["base_vehicle", "modification_details"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_fleet_discount",
         description: "Get fleet insurance discount for multiple vehicles",
         parameters: {
           type: "object",
           properties: {
             business_info: { type: "string", description: "Business information" },
             fleet_size: { type: "number", description: "Number of vehicles in fleet" }
           },
           required: ["business_info", "fleet_size"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_commercial_policy",
         description: "Process commercial auto insurance policy",
         parameters: {
           type: "object",
           properties: {
             business_type: { type: "string", description: "Type of business" },
             vehicle_usage: { type: "string", description: "Commercial vehicle usage" }
           },
           required: ["business_type", "vehicle_usage"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "calculate_umbrella_policy",
         description: "Calculate umbrella insurance policy for additional liability",
         parameters: {
           type: "object",
           properties: {
             current_limits: { type: "string", description: "Current liability limits" },
             desired_coverage: { type: "number", description: "Desired umbrella coverage amount" }
           },
           required: ["current_limits", "desired_coverage"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_international_coverage",
         description: "Process international driving coverage request",
         parameters: {
           type: "object",
           properties: {
             destination_countries: { type: "string", description: "Countries to be visited" },
             travel_duration: { type: "string", description: "Duration of international travel" }
           },
           required: ["destination_countries", "travel_duration"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_credit_score_impact",
         description: "Get impact of credit score on insurance rates",
         parameters: {
           type: "object",
           properties: {
             credit_score_range: { type: "string", description: "Credit score range" },
             state: { type: "string", description: "State (some states prohibit credit-based pricing)" }
           },
           required: ["credit_score_range", "state"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_payment_plan",
         description: "Set up custom payment plan for customer",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             payment_frequency: { type: "string", description: "Desired payment frequency" },
             down_payment: { type: "number", description: "Down payment amount" }
           },
           required: ["policy_number", "payment_frequency"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "calculate_pay_per_mile",
         description: "Calculate pay-per-mile insurance rates",
         parameters: {
           type: "object",
           properties: {
             estimated_miles: { type: "number", description: "Estimated annual miles" },
             base_rate: { type: "number", description: "Base monthly rate" }
           },
           required: ["estimated_miles", "base_rate"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_policy_transfer",
         description: "Process policy transfer to new state or address",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             new_address: { type: "string", description: "New address information" },
             effective_date: { type: "string", description: "Transfer effective date" }
           },
           required: ["policy_number", "new_address", "effective_date"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "get_policy_comparison",
         description: "Compare different policy options for customer",
         parameters: {
           type: "object",
           properties: {
             customer_needs: { type: "string", description: "Customer's insurance needs" },
             budget_range: { type: "string", description: "Customer's budget range" }
           },
           required: ["customer_needs", "budget_range"]
         }
       }
     },
     {
       type: "function" as const,
       function: {
         name: "process_endorsement",
         description: "Process policy endorsement or rider",
         parameters: {
           type: "object",
           properties: {
             policy_number: { type: "string", description: "Policy number" },
             endorsement_type: { type: "string", description: "Type of endorsement" },
             effective_date: { type: "string", description: "Endorsement effective date" }
           },
           required: ["policy_number", "endorsement_type", "effective_date"]
         }
       }
     }
   ];

  // Essential tools needed for test scenarios
  const requiredTools = [
    "get_quote",
    "check_coverage", 
    "file_claim",
    "add_driver",
    "get_discounts",
    "update_payment_method",
    "schedule_inspection", 
    "get_claim_status",
    "remove_driver",
    "update_vehicle_info"
  ];

  // Find all required tools
  const essentialTools = allTools.filter(tool => 
    requiredTools.includes(tool.function.name)
  );

  // Get remaining tools to fill up to the desired count
  const remainingTools = allTools.filter(tool => 
    !requiredTools.includes(tool.function.name)
  );

  // Combine essential tools with additional ones up to the count
  const additionalCount = Math.max(0, count - essentialTools.length);
  const additionalTools = remainingTools.slice(0, additionalCount);
  
  let selectedTools: OpenAI.Chat.Completions.ChatCompletionTool[];
  
  if (toolPlacement === 'start') {
    // Essential tools at the beginning
    selectedTools = [...essentialTools, ...additionalTools];
  } else if (toolPlacement === 'middle') {
    // Essential tools in the middle
    const midPoint = Math.floor(additionalTools.length / 2);
    selectedTools = [
      ...additionalTools.slice(0, midPoint),
      ...essentialTools,
      ...additionalTools.slice(midPoint)
    ];
  } else { // 'end'
    // Essential tools at the end
    selectedTools = [...additionalTools, ...essentialTools];
  }

  return selectedTools.slice(0, count);
};

// Test scenarios for Jerry's car insurance business - designed to test confusion
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
  },
  {
    prompt: "I need to update my payment method for policy POL555888. I want to change from credit card to bank transfer.",
    expectedTool: "update_payment_method"
  },
  {
    prompt: "Can you help me schedule a vehicle inspection for my policy POL999444? I prefer next Monday.",
    expectedTool: "schedule_inspection"
  },
  {
    prompt: "What's the status of my claim number CLM789123?",
    expectedTool: "get_claim_status"
  },
  {
    prompt: "I need to remove my daughter from policy POL111222. Her driver ID is DRV456.",
    expectedTool: "remove_driver"
  },
  {
    prompt: "Please update the mileage for my vehicle ID VEH999 on policy POL777888. Current mileage is 45000.",
    expectedTool: "update_vehicle_info"
  }
];

interface TestResult {
  toolCount: number;
  actualToolCount: number;
  toolPlacement: string;
  scenario: string;
  expectedTool: string;
  actualTool: string | null;
  success: boolean;
  responseTime: number;
  error?: string;
}

async function runTest(toolCount: number, scenario: any, toolPlacement: 'start' | 'middle' | 'end' = 'start'): Promise<TestResult> {
  const startTime = Date.now();
  const tools = generateCarInsuranceTools(toolCount, toolPlacement);
  
  try {
    
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
        actualToolCount: tools.length,
        toolPlacement,
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
      actualToolCount: tools.length,
      toolPlacement,
      scenario: scenario.prompt,
      expectedTool: scenario.expectedTool,
      actualTool,
      success,
      responseTime
    };

  } catch (error) {
    return {
      toolCount,
      actualToolCount: tools.length,
      toolPlacement,
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
  const toolCounts = [10, 20, 30, 40, 50, 100];
  const placements: ('start' | 'middle' | 'end')[] = ['start', 'middle', 'end'];

  for (const toolCount of toolCounts) {
    for (const placement of placements) {
      console.log(`\n📊 Testing with ${toolCount} tools (essential tools at ${placement})...`);
      
      for (const scenario of testScenarios) {
        console.log(`  - Running scenario: "${scenario.prompt.substring(0, 50)}..."`);
        
        const result = await runTest(toolCount, scenario, placement);
        results.push(result);
        
        console.log(`    Actual tools used: ${result.actualToolCount}/${toolCount} requested`);
        
        if (result.success) {
          console.log(`    ✅ Success: Called ${result.actualTool} (${result.responseTime}ms)`);
        } else {
          console.log(`    ❌ Failed: Expected ${result.expectedTool}, got ${result.actualTool || 'none'} (${result.responseTime}ms)`);
          if (result.error) {
            console.log(`    Error: ${result.error}`);
          }
        }
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Analyze results
  console.log("\n📈 Analysis Results");
  console.log("===================");
  
  const successRateByToolCountAndPlacement: { [key: string]: number } = {};
  const avgResponseTimeByToolCountAndPlacement: { [key: string]: number } = {};

  for (const toolCount of toolCounts) {
    for (const placement of placements) {
      const resultsForCountAndPlacement = results.filter(r => r.toolCount === toolCount && r.toolPlacement === placement);
      const successCount = resultsForCountAndPlacement.filter(r => r.success).length;
      const successRate = (successCount / resultsForCountAndPlacement.length) * 100;
      const avgResponseTime = resultsForCountAndPlacement.reduce((sum, r) => sum + r.responseTime, 0) / resultsForCountAndPlacement.length;
      
      const key = `${toolCount}-${placement}`;
      successRateByToolCountAndPlacement[key] = successRate;
      avgResponseTimeByToolCountAndPlacement[key] = avgResponseTime;
      
      console.log(`${toolCount} tools (${placement}): ${successRate.toFixed(1)}% success rate, ${avgResponseTime.toFixed(0)}ms avg response time`);
    }
  }

  // Find degradation patterns
  const degradationThreshold = 80;
  console.log(`\n🔍 Degradation Analysis (< ${degradationThreshold}% success rate):`);
  
  let foundDegradation = false;
  for (const toolCount of toolCounts) {
    for (const placement of placements) {
      const key = `${toolCount}-${placement}`;
      const successRate = successRateByToolCountAndPlacement[key];
      if (successRate < degradationThreshold) {
        console.log(`⚠️  ${toolCount} tools with essential tools at ${placement}: ${successRate.toFixed(1)}% success rate`);
        foundDegradation = true;
      }
    }
  }
  
  if (!foundDegradation) {
    console.log(`✅ Tool calling remains reliable across all configurations up to ${Math.max(...toolCounts)} tools`);
  }

  // Export detailed results
  console.log("\n📋 Detailed Results:");
  console.table(results.map(r => ({
    Tools: `${r.toolCount}(${r.actualToolCount})`,
    Placement: r.toolPlacement,
    Scenario: r.scenario.substring(0, 25) + "...",
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