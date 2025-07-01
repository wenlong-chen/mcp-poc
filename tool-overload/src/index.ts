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
        description: `Retrieves a comprehensive car insurance quote for a customer based on their specific requirements and risk profile. This tool is the primary method for generating accurate, real-time insurance quotes that reflect current market conditions, carrier availability, and regulatory requirements.

This tool performs extensive calculations considering multiple risk factors including but not limited to:
- Driver demographics (age, gender, marital status, credit score)
- Driving history and violations within the last 5 years
- Vehicle specifications (year, make, model, trim, safety features, anti-theft devices)
- Coverage preferences and deductible selections
- Geographic risk factors based on ZIP code (crime rates, weather patterns, traffic density)
- Previous insurance history and loyalty discounts
- Multi-policy bundling opportunities

The quote generation process involves:
1. Real-time carrier rate validation across our network of 50+ insurance partners
2. Regulatory compliance checks for state-specific minimum coverage requirements
3. Dynamic pricing based on current market conditions and carrier capacity
4. Discount eligibility assessment (good driver, defensive driving, multi-car, etc.)
5. Coverage recommendation engine based on customer profile and risk assessment

Response includes detailed breakdown of:
- Base premium calculations before discounts
- Applied discounts with savings amounts
- Coverage limits and deductibles for each coverage type
- Payment plan options (monthly, quarterly, semi-annual, annual)
- Policy effective date options and processing timeline
- Carrier-specific benefits and features
- State filing information and regulatory compliance details

This tool integrates with our underwriting engine and must be used for any customer requesting pricing information. Never provide estimated rates without calling this function first, as rates change frequently and manual estimates violate compliance requirements.

Error handling includes validation for suspended licenses, high-risk drivers requiring specialized markets, and vehicles that may be ineligible for standard coverage (such as modified vehicles, commercial use, or vehicles with salvage titles).`,
        parameters: {
          type: "object",
          properties: {
            age: { 
              type: "number", 
              description: "Primary driver's age in years. Must be 16 or older for standard policies. Ages 16-25 are considered high-risk and may have limited carrier options. Senior drivers (65+) may qualify for additional discounts." 
            },
            vehicle_year: { 
              type: "number", 
              description: "Vehicle model year. Must be within 25 years of current year for comprehensive/collision coverage eligibility. Newer vehicles (0-3 years) may qualify for new car replacement coverage." 
            },
            vehicle_make: { 
              type: "string", 
              description: "Vehicle manufacturer (e.g., Honda, Toyota, Ford). Luxury brands and high-performance vehicles typically have higher premiums due to increased repair costs and theft rates." 
            },
            zip_code: { 
              type: "string", 
              description: "Customer's residential ZIP code (5-digit format). This determines territorial rating factors, state requirements, and available carriers. Must be valid US ZIP code." 
            }
          },
          required: ["age", "vehicle_year", "vehicle_make", "zip_code"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "get_instant_quote",
        description: `Provides a rapid, simplified insurance quote estimation designed for customers who need immediate pricing feedback without providing complete application details. This tool is optimized for speed and user experience, typically returning results within 2-3 seconds.

The instant quote engine uses statistical modeling and machine learning algorithms trained on millions of quotes to provide accurate estimates based on minimal input. While not binding, these quotes are typically within 5-10% of final pricing for standard risk profiles.

Key features and limitations:
- Uses aggregated risk data for the specified vehicle type and location
- Applies standard coverage assumptions (state minimums with basic comprehensive/collision)
- Includes typical driver profile assumptions (35-year-old with clean record)
- Does not account for individual driver history, credit score, or specific vehicle features
- Provides multiple coverage tier options (Basic, Standard, Preferred)
- Shows estimated monthly payment ranges for budgeting purposes

The tool automatically adjusts for:
- State-specific minimum coverage requirements
- Regional pricing variations and carrier availability
- Vehicle type risk classifications (sedan, SUV, truck, motorcycle, etc.)
- Urban vs. rural territory adjustments
- Seasonal pricing fluctuations

Response includes:
- Estimated monthly premium range with confidence intervals
- Coverage summary for each tier option
- Disclaimer about factors that may affect final pricing
- Next steps for obtaining formal quotes
- Invitation to complete full application for accurate pricing

This tool is ideal for:
- Initial customer engagement and lead qualification
- Price sensitivity assessment
- Competitive analysis and market positioning
- Budget planning and affordability discussions

Note: Instant quotes are valid for 24 hours and cannot be bound without completing full underwriting process through get_quote function.`,
        parameters: {
          type: "object",
          properties: {
            vehicle_type: { 
              type: "string", 
              description: "General category of vehicle (sedan, SUV, truck, coupe, convertible, motorcycle, RV, etc.). This determines base risk classification and coverage options available." 
            },
            zip_code: { 
              type: "string", 
              description: "Customer's residential ZIP code for territorial rating and state requirement determination. Must be valid 5-digit US ZIP code." 
            }
          },
          required: ["vehicle_type", "zip_code"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "get_premium_quote",
        description: `Generates a comprehensive premium insurance quote with enhanced coverage options and personalized recommendations for customers seeking maximum protection and peace of mind. This tool provides access to our highest tier coverage options with additional benefits and services not available in standard policies.

Premium quote features include:
- Enhanced liability limits starting at 250/500/100 with options up to 1M/1M/1M
- Lower deductibles ($0-$250) for comprehensive and collision coverage
- Additional coverage options: rental car reimbursement, gap coverage, new car replacement
- Accident forgiveness and diminishing deductible programs
- 24/7 concierge claims service with dedicated adjuster assignment
- Preferred repair shop network with lifetime guarantees
- Enhanced roadside assistance including lockout service, jump starts, and towing
- Identity theft protection and credit monitoring services

The premium quote engine considers:
- Customer's complete insurance and claim history across all carriers
- Credit-based insurance score (where legally permitted)
- Advanced telematics data for usage-based pricing
- Property ownership and other indicators of financial stability
- Professional affiliations and group membership discounts
- Multi-policy bundling opportunities with home, umbrella, and life insurance

Underwriting process includes:
1. Comprehensive MVR (Motor Vehicle Record) analysis
2. CLUE report review for prior claims activity
3. Credit report analysis (where permitted by state law)
4. Property records verification for homeownership discounts
5. Professional licensing verification for occupation-based discounts

Response provides:
- Detailed coverage comparison matrix across multiple carriers
- Cost-benefit analysis of coverage enhancements
- Personalized risk assessment and coverage recommendations
- Premium financing options for higher coverage limits
- White-glove onboarding process timeline
- Dedicated agent assignment information

This tool should be used for customers with:
- High-value vehicles or multiple vehicles
- Previous claims experience requiring enhanced protection
- Professional or business use considerations
- Desire for maximum coverage and service levels
- Complex family situations with multiple drivers`,
        parameters: {
          type: "object",
          properties: {
            customer_id: { 
              type: "string", 
              description: "Unique customer identifier in Jerry's system. Used to retrieve complete customer profile, previous quotes, claim history, and preferences for personalized premium calculations." 
            },
            coverage_level: { 
              type: "string", 
              description: "Desired premium coverage tier: 'Enhanced' (250/500/100 limits), 'Superior' (500/500/500 limits), 'Ultimate' (1M/1M/1M limits). Each tier includes progressively more comprehensive benefits and lower deductibles." 
            }
          },
          required: ["customer_id", "coverage_level"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "calculate_quote",
        description: `Performs detailed actuarial calculations for insurance quotes using advanced risk modeling algorithms and proprietary scoring systems. This tool is designed for complex scenarios where standard quote engines may not capture all relevant risk factors or where custom coverage configurations are required.

The calculation engine incorporates:

Risk Assessment Components:
- Proprietary Jerry Risk Score (0-1000 scale) based on 200+ data points
- Predictive modeling using machine learning algorithms trained on 10M+ policies
- Real-time data integration from MVR, CLUE, credit bureaus, and public records
- Geographic risk modeling including crime statistics, weather patterns, and traffic data
- Vehicle-specific risk factors including theft rates, repair costs, and safety ratings

Advanced Pricing Factors:
- Dynamic market pricing based on carrier capacity and competition
- Seasonality adjustments for regional weather and claim patterns
- Economic indicators affecting repair costs and medical expenses
- Regulatory changes and state insurance department filing updates
- Carrier-specific underwriting guidelines and appetite changes

Calculation Methodology:
1. Base rate determination using ISO (Insurance Services Office) classifications
2. Territory factor application based on ZIP+4 precision geocoding
3. Vehicle rating using VIN decoding and manufacturer safety data
4. Driver factor calculation including age, gender, marital status (where permitted)
5. Coverage selection impact analysis with deductible optimization
6. Discount application in order of carrier-specific preference hierarchy
7. State tax and fee calculation with regulatory compliance verification

Output Details:
- Line-by-line premium breakdown for each coverage component
- Risk factor impact analysis showing drivers of pricing
- Alternative scenario modeling (different deductibles, coverage limits)
- Carrier comparison matrix with detailed rate differences
- Regulatory filing compliance verification
- Rate change prediction for renewal planning

This tool requires elevated risk assessment capabilities and should be used for:
- High-risk drivers requiring specialized underwriting
- Commercial or business use vehicles
- Modified or custom vehicles requiring individual consideration
- Customers with complex insurance histories or unique circumstances
- Rate validation for competitive analysis
- Pricing optimization for retention scenarios`,
        parameters: {
          type: "object",
          properties: {
            risk_score: { 
              type: "number", 
              description: "Jerry proprietary risk score (0-1000 scale). 0-200: Preferred risk, 201-500: Standard risk, 501-750: Substandard risk, 751-1000: High risk requiring specialized markets. Calculated using 200+ data points including driving record, credit history, claims experience, and behavioral indicators." 
            },
            vehicle_value: { 
              type: "number", 
              description: "Current actual cash value of vehicle in USD. Used for comprehensive/collision premium calculation, gap coverage determination, and total loss thresholds. Must be current market value, not purchase price or loan balance." 
            }
          },
          required: ["risk_score", "vehicle_value"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "estimate_quote",
        description: `Provides preliminary insurance cost estimates based on summarized driver profile information, designed for early-stage customer engagement and lead qualification scenarios. This tool bridges the gap between instant quotes and full underwriting by incorporating more detailed customer information while maintaining speed and simplicity.

Estimation Methodology:
- Statistical modeling based on aggregated data from similar customer profiles
- Machine learning algorithms trained on Jerry's quote database of 50M+ quotes
- Real-time market adjustment factors based on current carrier pricing trends
- Geographic risk modeling specific to customer's metropolitan area
- Seasonal and economic factors affecting insurance market conditions

Profile Analysis Includes:
- Age and demographic risk classification
- Simplified driving record assessment (clean, minor violations, major violations)
- Vehicle category and value range determination
- Coverage preference indication (minimum, standard, comprehensive)
- Previous insurance experience and loyalty factors

The tool processes natural language driver profiles and extracts:
- Primary risk indicators and red flags
- Opportunity identification for specialized products or discounts
- Carrier suitability assessment based on underwriting preferences
- Price sensitivity indicators for sales strategy optimization

Estimation Output:
- Monthly premium ranges with confidence intervals (±15% accuracy)
- Multiple coverage tier options with benefit comparisons
- Discount opportunity identification (multi-car, bundling, etc.)
- Risk factor assessment with improvement recommendations
- Next steps recommendation for quote progression

Response includes educational content about:
- How various factors affect insurance pricing
- Coverage options and their purposes
- State requirement explanations
- Jerry's unique value proposition and services
- Timeline expectations for policy implementation

This tool is particularly valuable for:
- Customers hesitant to provide detailed personal information initially
- Complex family situations requiring consultation before detailed quoting
- International customers unfamiliar with US insurance requirements
- Price shopping scenarios where quick comparisons are needed
- Marketing campaign response tracking and lead scoring

Note: Estimates are provided for informational purposes only and are not binding quotes. Actual pricing may vary based on complete underwriting review.`,
        parameters: {
          type: "object",
          properties: {
            driver_profile: { 
              type: "string", 
              description: "Comprehensive text description of driver profile including age range, driving experience, vehicle type, location, coverage preferences, and any relevant circumstances. Example: '28-year-old professional, clean driving record, 2021 Honda Accord, downtown Chicago, seeking full coverage with moderate deductibles, currently with Geico paying $180/month.'" 
            }
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
        description: `Retrieves comprehensive policy coverage details and provides detailed analysis of current protection levels, coverage gaps, and enhancement opportunities. This tool serves as the primary method for policy review and customer service inquiries about existing coverage.

Coverage Analysis Includes:

Policy Overview:
- Current policy number, effective dates, and renewal timeline
- Carrier information and policy type (standard, preferred, non-standard)
- Premium breakdown by coverage component and payment schedule
- Policy documents and endorsement history
- Automatic payment and billing preferences

Detailed Coverage Review:
- Liability coverage limits (Bodily Injury per person/accident, Property Damage)
- Physical damage coverage (Comprehensive, Collision with deductibles)
- Additional coverages (Medical Payments, PIP, Uninsured/Underinsured Motorist)
- Rental reimbursement limits and duration
- Towing and labor coverage specifications
- Gap coverage and loan/lease protection details

Vehicle and Driver Information:
- All vehicles listed on policy with accurate VIN, year, make, model
- Driver information including license status and violation history
- Coverage assignments and excluded drivers
- Good student and defensive driving discount applications
- Telematics program participation and performance scoring

Compliance and Protection Assessment:
- State minimum requirement compliance verification
- Lender requirement satisfaction for financed/leased vehicles
- Coverage adequacy analysis based on customer's financial exposure
- Identified gaps or potential coverage enhancement opportunities
- Comparative analysis with industry benchmarks and Jerry recommendations

Claims Integration:
- Active claims status and impact on coverage
- Claims history and loss ratio analysis
- Deductible tracking and vanishing deductible program status
- Accident forgiveness program eligibility and application

The tool automatically flags:
- Coverage limits that may be insufficient for customer's risk profile
- Missing coverages that could leave significant gaps
- Opportunities for premium reduction through deductible optimization
- Multi-policy bundling opportunities with home/renters insurance
- Carrier-specific benefits and programs not currently utilized

Response format includes:
- Easy-to-understand coverage summary with plain English explanations
- Visual coverage comparison charts when beneficial
- Specific recommendations for coverage improvements
- Cost impact analysis for suggested changes
- Timeline for implementing coverage modifications

This tool must be used for any customer inquiry about their current coverage and should be called before making any policy modifications or recommendations.`,
        parameters: {
          type: "object",
          properties: {
            policy_number: { 
              type: "string", 
              description: "Complete policy number including carrier prefix and any suffix codes. Format varies by carrier but typically 8-12 alphanumeric characters. Used to retrieve all policy details, coverage specifications, and associated customer information from the policy management system." 
            }
          },
          required: ["policy_number"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "verify_coverage",
        description: `Performs comprehensive verification of active insurance coverage status, including real-time validation with carrier systems and regulatory databases. This tool is essential for confirming coverage validity, identifying potential lapses, and ensuring compliance with legal and lender requirements.

Verification Process:

Real-Time Carrier Integration:
- Direct API connections with 50+ insurance carriers for instant coverage verification
- Policy status confirmation (active, suspended, cancelled, non-renewed)
- Premium payment status and any outstanding balances
- Coverage effective dates and expiration timeline
- Policy modification history and pending changes

Regulatory Compliance Checks:
- State insurance database verification for compliance reporting
- SR-22 filing status and court-ordered requirements
- Commercial vehicle compliance for business use
- International coverage verification for cross-border travel
- Self-insurance certification for qualified entities

Financial Responsibility Verification:
- Minimum state coverage requirement compliance
- Lender-required coverage verification for financed vehicles
- Lienholder notification and certificate issuance
- Gap coverage validation for lease agreements
- Umbrella policy coordination and underlying coverage requirements

Coverage Authenticity Assessment:
- Policy document verification and fraud detection
- Carrier authorization and licensing verification
- Agent/broker appointment validation
- Premium payment method verification and chargeback protection
- Policy binding authority confirmation

Multi-State Coverage Coordination:
- Interstate coverage compliance for customers with multiple residences
- Military personnel PCS (Permanent Change of Station) coverage continuity
- Student coverage for out-of-state college attendance
- Business travel and temporary relocation coverage verification

The verification process includes:
1. Customer identity authentication and authorization
2. Policy lookup across multiple carrier systems and databases
3. Coverage comparison against stated requirements
4. Gap analysis and risk exposure identification
5. Compliance certification generation for third parties

Output provides:
- Coverage verification certificate with official seal
- Detailed coverage summary with limits and deductibles
- Compliance status report for all applicable requirements
- Risk exposure analysis and recommendations
- Action items for maintaining coverage compliance

This tool should be used for:
- Employment verification requirements
- Vehicle registration and DMV compliance
- Lender audits and loan modification reviews
- Legal proceedings requiring coverage confirmation
- International travel and vehicle export documentation
- Business license applications requiring insurance proof`,
        parameters: {
          type: "object",
          properties: {
            customer_id: { 
              type: "string", 
              description: "Unique Jerry customer identifier used to access all associated policies, claims history, and account information. Links to comprehensive customer profile including contact information, vehicle inventory, driver records, and policy preferences across all Jerry services." 
            }
          },
          required: ["customer_id"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "review_coverage",
        description: `Conducts a comprehensive, expert-level analysis of existing insurance coverage with detailed recommendations for optimization, gap closure, and cost management. This tool provides the foundation for annual policy reviews, life event adjustments, and proactive risk management consulting.

Comprehensive Coverage Analysis:

Current Protection Assessment:
- Line-by-line coverage evaluation against industry best practices
- Adequacy analysis based on customer's current financial situation and assets
- Risk exposure quantification with potential financial impact modeling
- Comparative analysis against state requirements and lender mandates
- Historical claims pattern analysis and coverage utilization review

Market Positioning Review:
- Competitive rate analysis across Jerry's carrier network
- Coverage feature comparison with similar policies in the market
- Discount optimization opportunities and eligibility verification
- Carrier stability assessment including financial strength ratings
- Customer satisfaction metrics and claims handling reputation analysis

Life Event Impact Assessment:
- Coverage needs analysis based on recent life changes (marriage, divorce, new drivers, etc.)
- Vehicle changes and their impact on coverage requirements and pricing
- Geographic moves and multi-state coverage considerations
- Income changes affecting appropriate liability limits and premium affordability
- Retirement planning and coverage needs evolution

Advanced Risk Modeling:
- Predictive analytics for potential coverage needs over next 3-5 years
- Economic factor impact on insurance costs and coverage requirements
- Emerging risk assessment (autonomous vehicles, ride-sharing, work-from-home trends)
- Climate change impact on comprehensive coverage and deductible strategies
- Technology integration opportunities (telematics, smart home integration)

Optimization Strategies:
- Premium reduction opportunities through deductible adjustments
- Multi-policy bundling analysis with detailed savings projections
- Payment plan optimization for cash flow management
- Coverage enhancement cost-benefit analysis
- Loyalty program participation and long-term discount strategies

Professional Consultation Elements:
- Risk tolerance assessment and coverage philosophy alignment
- Financial planning integration with insurance protection strategies
- Estate planning considerations and beneficiary designations
- Business use implications and commercial coverage transition planning
- International travel and extended absence coverage planning

The review process includes:
1. Data collection from multiple sources (policies, claims, credit, MVR)
2. Advanced analytics application using Jerry's proprietary algorithms
3. Expert consultation integration with certified insurance professionals
4. Customized recommendation development with implementation timeline
5. Follow-up planning and monitoring protocols

Deliverables include:
- Comprehensive written coverage analysis report
- Visual coverage gap identification charts
- Detailed recommendation matrix with cost-benefit analysis
- Implementation timeline with prioritized action items
- Ongoing monitoring schedule and trigger points for future reviews

This tool should be used for:
- Annual policy renewal consultations
- Major life event assessments
- Customer retention and loyalty building
- Premium audit and cost management consulting
- Risk management advisory services`,
        parameters: {
          type: "object",
          properties: {
            policy_id: { 
              type: "string", 
              description: "Unique policy identifier within Jerry's system, distinct from carrier policy numbers. Links to comprehensive policy history, customer interactions, quote comparisons, claims integration, and all related Jerry services and recommendations. Used for deep analytical review and consulting services." 
            }
          },
          required: ["policy_id"]
        }
      }
    },

    // Claims functions
    {
      type: "function" as const,
      function: {
        name: "file_claim",
        description: `Initiates the comprehensive claims filing process for customers who have experienced a covered loss or incident. This tool serves as the primary entry point for all insurance claims and integrates with multiple systems to ensure accurate, efficient claim processing while providing exceptional customer support during stressful situations.

Comprehensive Claims Processing System:

Initial Claim Intake:
- First Notice of Loss (FNOL) processing with immediate claim number assignment
- Real-time integration with carrier claims systems for instant case creation
- Automated coverage verification to confirm policy validity and coverage applicability
- Geographic incident verification using GPS and mapping services
- Weather condition assessment for weather-related claims
- Police report integration where applicable for accident claims

Claim Type Classification and Routing:
- Collision Claims: Vehicle-to-vehicle accidents, single-vehicle incidents, hit-and-run scenarios
- Comprehensive Claims: Theft, vandalism, glass damage, weather events, animal strikes
- Liability Claims: Third-party property damage and bodily injury claims
- Medical Claims: Personal Injury Protection (PIP) and Medical Payments coverage
- Uninsured/Underinsured Motorist Claims: Accidents with inadequately insured parties
- Total Loss Claims: Vehicles declared constructive or actual total losses

Advanced Claim Assessment Features:
- AI-powered fraud detection algorithms analyzing claim patterns and risk indicators
- Automated damage estimation using photo analysis and machine learning
- Real-time parts availability and repair cost estimation
- Preferred repair shop network matching based on location and specialization
- Rental car eligibility determination and reservation coordination
- Medical provider network verification for injury-related claims

Digital Documentation and Evidence Management:
- Secure photo and video upload with automatic metadata capture
- Document scanning and storage with OCR (Optical Character Recognition)
- Digital signature capability for claim forms and authorizations
- Integration with repair shop estimates and work authorization systems
- Medical record and billing integration for injury claims
- Police report automatic retrieval from law enforcement databases

Claims Advocacy and Support Services:
- 24/7 claims reporting hotline with multi-language support
- Dedicated claims adjuster assignment for complex cases
- Proactive claim status updates via SMS, email, and app notifications
- Settlement negotiation support and guidance
- Dispute resolution assistance and carrier advocacy
- Legal referral network for complex liability situations

Financial Processing and Settlement:
- Automated deductible calculation and application
- Multiple payment method options including direct deposit and physical checks
- Loss payee and lienholder notification for financed vehicles
- Tax reporting assistance for claim settlements
- Subrogation coordination for third-party recovery
- Salvage value determination and vehicle title transfer assistance

Regulatory Compliance and Reporting:
- State insurance department reporting requirements
- Cooperation with law enforcement investigations
- CARFAX and vehicle history report updates
- DMV notification for total loss vehicles
- Workers' compensation coordination for work-related incidents
- HIPAA compliance for medical information handling

Quality Assurance and Customer Satisfaction:
- Real-time claim satisfaction surveys and feedback collection
- Claim outcome analysis and process improvement identification
- Carrier performance monitoring and advocacy escalation
- Legal compliance verification throughout the claims process
- Customer education about rights and options during claim resolution

This tool must be used for ANY customer reporting a loss, incident, or damage to their vehicle or seeking to file any type of insurance claim. The system automatically routes claims to appropriate specialists and ensures all regulatory and carrier requirements are met while maximizing customer advocacy and satisfaction.`,
        parameters: {
          type: "object",
          properties: {
            policy_number: { 
              type: "string", 
              description: "Complete policy number including carrier prefix and check digits. This links the claim to the specific insurance policy and triggers automatic coverage verification, deductible lookup, and carrier notification. Must be active policy with current premium payments." 
            },
            incident_type: { 
              type: "string", 
              description: "Specific type of incident requiring claim filing. Options include: 'collision' (vehicle accidents), 'comprehensive' (theft, vandalism, weather), 'glass' (windshield damage), 'liability' (damage to others), 'uninsured_motorist' (hit by uninsured driver), 'pip_medical' (personal injury), 'roadside' (towing/emergency). This determines claim routing, adjuster assignment, and processing workflow." 
            },
            description: { 
              type: "string", 
              description: "Detailed narrative description of the incident including date, time, location, weather conditions, parties involved, damage assessment, injuries, police involvement, and any relevant circumstances. This information is critical for claim evaluation, fraud detection, and coverage determination. Include specific details about how the incident occurred and immediate actions taken." 
            }
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
        description: `Facilitates the addition of new drivers to an existing insurance policy through a comprehensive underwriting and verification process. This tool manages all aspects of driver addition including risk assessment, rate calculation, legal compliance, and policy modification documentation.

Comprehensive Driver Addition Process:

Initial Driver Verification and Validation:
- Identity verification through multiple databases and credit bureaus
- Social Security number validation and fraud prevention checks
- Address verification and residency confirmation
- Driver's license validation through state DMV database integration
- Driving record retrieval and analysis through MVR (Motor Vehicle Record) reports
- Claims history research through CLUE (Comprehensive Loss Underwriting Exchange) database

Risk Assessment and Underwriting:
- Age-based risk classification with actuarial modeling
- Driving experience evaluation and new driver risk assessment
- Violation history analysis including moving violations, suspensions, and DUI/DWI records
- Accident history review with fault determination and claim severity analysis
- Credit-based insurance scoring where legally permitted by state regulations
- Multi-state driving record compilation for drivers with out-of-state history

Rate Impact Calculation and Premium Adjustment:
- Real-time premium recalculation based on new driver's risk profile
- Carrier-specific underwriting guidelines application
- Territory rating adjustment for driver's primary residence
- Vehicle assignment optimization for household coverage efficiency
- Discount eligibility assessment (good student, defensive driving, multi-driver)
- Payment plan modification and billing cycle adjustment

Legal and Regulatory Compliance:
- State-specific minimum age requirements for policy addition
- Parental consent verification for minor drivers
- Household member disclosure requirements and exclusion options
- Named driver vs. occasional driver classification
- SR-22 filing coordination for high-risk drivers
- International license recognition and conversion requirements

Documentation and Policy Management:
- Digital driver's license scanning and verification
- Policy endorsement generation with effective date coordination
- Lienholder notification for financed vehicles with new drivers
- Certificate of insurance updates with new driver information
- Beneficiary designation updates for life insurance components
- Emergency contact information collection and verification

Specialized Driver Categories:
- Teen Driver Programs: Graduated driver licensing compliance, parental controls, telematics enrollment
- Senior Driver Assessment: Vision and medical clearance requirements, defensive driving credits
- Commercial Driver Integration: CDL verification, business use coordination, fleet management
- International Drivers: License translation, international driving permit validation, embassy coordination
- Military Personnel: PCS (Permanent Change of Station) handling, deployment considerations, overseas coverage
- Student Drivers: Away-at-school discounts, school location verification, seasonal coverage adjustments

Training and Safety Programs:
- Defensive driving course enrollment and credit application
- Teen driver education program coordination
- Telematics device installation and monitoring setup
- Safe driving app integration and family dashboard access
- Driver improvement program referrals for high-risk additions
- Insurance-sponsored safety course recommendations

Post-Addition Monitoring and Support:
- New driver orientation and policy education
- Claim reporting training and emergency contact setup
- App access provisioning and feature demonstration
- Regular driving record monitoring and update alerts
- Anniversary review scheduling for rate optimization
- Continuous education about coverage options and safety practices

This tool is essential for any request to add a new driver to an existing policy and ensures full compliance with underwriting standards, legal requirements, and carrier guidelines while optimizing coverage and costs for the entire household.`,
        parameters: {
          type: "object",
          properties: {
            policy_number: { 
              type: "string", 
              description: "Active policy number to which the new driver will be added. Used to retrieve current policy details, coverage limits, vehicle assignments, and billing information. Must be valid policy with current premium payments and no pending cancellations." 
            },
            driver_name: { 
              type: "string", 
              description: "Complete legal name of driver to be added, exactly as it appears on their driver's license. Include full first name, middle initial if applicable, and last name. This name will appear on all policy documents, certificates, and must match government-issued identification for verification purposes." 
            },
            driver_age: { 
              type: "number", 
              description: "Current age of driver in years. Critical for risk classification and rate calculation. Drivers under 25 are considered high-risk, ages 25-65 are standard risk, and drivers over 65 may qualify for senior discounts. Age affects available coverage options and carrier acceptance." 
            },
            license_number: { 
              type: "string", 
              description: "Complete driver's license number exactly as shown on physical license, including any letters, numbers, or special characters. Used for MVR (Motor Vehicle Record) lookup, identity verification, and state DMV integration. Include issuing state abbreviation if different from policy state." 
            }
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
        description: `Facilitates secure modification of customer payment methods through a comprehensive financial verification and security system. This tool manages all aspects of payment method changes including fraud prevention, compliance verification, and seamless transition to new payment arrangements while maintaining uninterrupted coverage.

Comprehensive Payment Method Management:

Supported Payment Methods:
- Bank Account (ACH): Checking and savings accounts with routing number verification
- Credit Cards: Visa, MasterCard, American Express, Discover with real-time authorization
- Debit Cards: Bank-issued debit cards with PIN or signature verification
- Digital Wallets: PayPal, Apple Pay, Google Pay, Samsung Pay integration
- Prepaid Cards: Qualified prepaid cards with sufficient balance verification
- Wire Transfers: For large premium payments and international customers
- Money Orders: Traditional payment method with verification and processing
- Electronic Checks: Digital check processing with instant verification

Security and Fraud Prevention:
- Multi-factor authentication for payment method changes
- Device fingerprinting and behavioral analysis
- Real-time fraud scoring with machine learning algorithms
- CVV verification and address matching for credit card transactions
- Bank account ownership verification through micro-deposit testing
- Chargeback protection and dispute resolution protocols
- PCI DSS compliance for secure payment data handling
- Encryption of all financial information with industry-standard protocols

Financial Institution Integration:
- Real-time bank account verification through Plaid and Yodlee integration
- Credit card authorization and pre-authorization for recurring payments
- NSF (Non-Sufficient Funds) prevention through balance checking
- Alternative payment network routing for failed transactions
- International payment processing for overseas customers
- Business account verification for commercial policies
- Trust account and escrow account special handling
- Financial institution communication for payment issues

Payment Schedule Optimization:
- Monthly, quarterly, semi-annual, and annual payment plan options
- Due date customization based on customer cash flow preferences
- Automatic payment scheduling with customizable timing
- Split payment arrangements for large premiums
- Grace period management and late fee calculation
- Payment reminder systems with multiple notification channels
- Hardship payment plans for customers experiencing financial difficulties
- Seasonal payment adjustments for irregular income customers

Regulatory Compliance and Documentation:
- State insurance department payment regulation compliance
- Anti-money laundering (AML) verification and reporting
- Know Your Customer (KYC) requirements for new payment methods
- OFAC (Office of Foreign Assets Control) screening for international payments
- State-specific payment method restrictions and requirements
- Consumer protection law compliance for automatic payments
- Audit trail maintenance for all payment method changes
- Documentation requirements for business and commercial accounts

Billing Integration and Coordination:
- Automatic billing system updates with new payment information
- Pro-rated billing adjustments for mid-term payment method changes
- Cancellation and refund processing through new payment methods
- Policy reinstatement payment processing after lapse
- Carrier billing system synchronization for seamless payment flow
- Multi-policy payment consolidation for bundled coverage
- Payment allocation for multiple policies and coverage types
- Installment fee calculation and adjustment for payment plan changes

Customer Experience and Support:
- Real-time payment method validation and confirmation
- Immediate payment processing for urgent coverage needs
- Payment history preservation and accessibility
- Customer notification of successful payment method updates
- 24/7 customer support for payment-related issues
- Mobile app integration for on-the-go payment management
- Paperless billing setup and electronic receipt delivery
- Payment confirmation and receipt generation

Error Handling and Recovery:
- Failed payment retry logic with escalation protocols
- Alternative payment method suggestions for declined transactions
- Customer notification systems for payment issues
- Manual intervention protocols for complex payment situations
- Dispute resolution support for payment disagreements
- Refund processing and overpayment correction
- Payment reversal capabilities for erroneous transactions
- Emergency payment processing for coverage maintenance

Performance Monitoring and Analytics:
- Payment success rate tracking and optimization
- Customer satisfaction monitoring for payment experience
- Cost analysis for different payment methods and processing fees
- Performance benchmarking against industry standards
- Payment trend analysis and seasonal adjustment planning
- Risk assessment for payment method fraud prevention
- Revenue optimization through payment timing and method selection

This tool is critical for maintaining customer payment preferences and ensuring uninterrupted insurance coverage while providing maximum security and convenience. All payment method updates are processed in real-time with immediate verification and confirmation.`,
        parameters: {
          type: "object",
          properties: {
            policy_number: { 
              type: "string", 
              description: "Active policy number for which payment method is being updated. Used to verify policy status, retrieve current billing information, calculate payment schedules, and ensure proper payment allocation. Must be valid policy with no pending cancellations or disputes." 
            },
            payment_type: { 
              type: "string", 
              description: "Type of payment method being set up: 'checking_account' (bank ACH), 'savings_account' (bank ACH), 'credit_card' (Visa/MC/Amex/Discover), 'debit_card' (bank-issued), 'digital_wallet' (PayPal/Apple Pay/Google Pay), 'wire_transfer' (large payments), 'money_order' (traditional). Each type requires different verification processes and has specific processing timelines and fees." 
            }
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
        description: `Performs comprehensive analysis of all available discount opportunities for a customer, utilizing advanced algorithms and extensive database integration to identify every possible savings opportunity across Jerry's entire carrier network. This tool serves as the cornerstone of Jerry's value proposition by ensuring customers receive maximum savings on their insurance premiums.

Comprehensive Discount Discovery System:

Driver-Based Discounts:
- Good Driver Discount: Analysis of 3-5 year driving record with violation-free periods
- Defensive Driving Course Credit: Verification of completed courses with certificate validation
- Mature Driver Discount: Age-based savings for drivers 50+ with clean records
- Good Student Discount: GPA verification, honor roll status, and academic achievement recognition
- Student Away at School Discount: Distance-from-home verification and school enrollment confirmation
- Military Discount: Active duty, veteran, and family member benefits with service verification
- Professional Association Discounts: Employment verification and group membership validation
- Alumni Discounts: University affiliation and graduation year verification

Vehicle-Based Discounts:
- Anti-Theft Device Discount: Factory and aftermarket security system verification
- Safety Feature Discount: Airbags, ABS, electronic stability control, and advanced driver assistance systems
- Hybrid/Electric Vehicle Discount: Environmental benefits and fuel efficiency incentives
- New Vehicle Discount: Model year qualification and replacement cost considerations
- Low Mileage Discount: Annual mileage verification and usage-based pricing
- Garage Discount: Secured parking verification and theft risk reduction
- Multi-Vehicle Discount: Household vehicle count and bundling opportunities
- Classic/Antique Vehicle Discount: Age, usage, and storage requirement verification

Policy and Coverage Discounts:
- Multi-Policy Bundling: Home, renters, motorcycle, boat, and umbrella integration
- Loyalty Discount: Tenure with carrier and claim-free bonus calculations
- Advance Purchase Discount: Early renewal and policy start date optimization
- Paperless Billing Discount: Electronic document delivery and environmental savings
- Auto-Pay Discount: Automatic payment setup and billing efficiency incentives
- Full Payment Discount: Annual premium payment vs. installment savings
- Online Purchase Discount: Digital transaction incentives and cost reduction benefits
- Telematics Discount: Usage-based insurance and safe driving monitoring programs

Carrier-Specific Programs:
- Brand Loyalty Programs: Previous carrier relationship benefits and transfer incentives
- Accident Forgiveness: First accident protection and rate impact mitigation
- Vanishing Deductible: Safe driving rewards and deductible reduction programs
- New Customer Incentives: Switch savings and competitive acquisition offers
- Renewal Loyalty Benefits: Long-term customer retention rewards
- Claims-Free Bonuses: Annual renewal credits and risk management incentives
- Group Insurance Programs: Employer-sponsored and affinity group benefits

Advanced Discount Optimization:
- Stacking Analysis: Compatible discount combinations and maximum savings calculations
- Time-Based Optimization: Discount eligibility timing and renewal coordination
- Geographic Advantages: State-specific programs and regional incentive availability
- Seasonal Promotions: Limited-time offers and marketing campaign benefits
- Cross-Selling Opportunities: Additional product discounts through portfolio expansion
- Referral Programs: Customer acquisition incentives and network building rewards

Real-Time Verification and Application:
- Automated eligibility confirmation through third-party databases
- Document verification and certification validation
- Background check integration for employment and education verification
- DMV record analysis for driving history and vehicle information
- Credit report integration for financial stability and insurance scoring
- Property record verification for homeownership and bundling opportunities

Financial Impact Analysis:
- Monthly premium reduction calculations with confidence intervals
- Annual savings projections with rate stability assessments
- Total cost of ownership impact including deductible considerations
- Competitive analysis against market rates with discount applications
- ROI analysis for discount-qualifying investments (security systems, courses)
- Payment plan optimization with discount timing considerations

Ongoing Monitoring and Optimization:
- Continuous eligibility tracking with automatic application of new discounts
- Anniversary review scheduling for discount renewal and expansion
- Life event triggered discount evaluations (marriage, graduation, military service)
- Vehicle change impact analysis and discount portability assessment
- Carrier comparison with discount advantage analysis
- Market trend monitoring for emerging discount opportunities

This tool is essential for ANY customer interaction and should be used proactively to ensure maximum value delivery and customer satisfaction. The system maintains detailed audit trails for compliance purposes and provides transparent documentation of all applied discounts.`,
        parameters: {
          type: "object",
          properties: {
            customer_id: { 
              type: "string", 
              description: "Unique Jerry customer identifier used to access comprehensive customer profile including demographics, driving history, vehicle inventory, policy history, claim records, payment preferences, and all stored documentation. Links to verification databases for education, employment, military service, and group affiliations for discount eligibility determination." 
            }
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
          content: `### COMPANY BACKGROUND AND CONTEXT ###

Jerry is a leading technology company and digital insurance marketplace that revolutionizes car ownership and insurance purchasing in the United States. Founded with the mission of making car ownership transparent, affordable, and hassle-free, Jerry has grown to serve millions of customers across all 50 states.

Our comprehensive platform includes:
- AI-powered insurance quote comparison across 50+ top-rated carriers
- Real-time rate monitoring and automatic savings identification
- Digital policy management and claims assistance
- Maintenance scheduling and automotive service coordination
- DMV services and vehicle registration assistance
- Financial products including auto loans and refinancing
- Emergency roadside assistance and breakdown coverage

Jerry partners with major insurance companies including State Farm, GEICO, Progressive, Allstate, USAA, Liberty Mutual, Farmers, Nationwide, American Family, and many regional carriers to provide comprehensive coverage options at competitive rates.

##
### YOUR ROLE AND RESPONSIBILITIES ###

You are Jerry's AI Customer Success Specialist, providing expert insurance consultation through our award-winning mobile app's in-app chat service. You serve as the primary point of contact for both prospective customers exploring insurance options and existing policyholders managing their coverage.

Your core responsibilities include:
- Providing personalized insurance guidance and education
- Facilitating quote comparisons and policy selections
- Assisting with claims processes and coverage questions
- Helping customers optimize their coverage and costs
- Resolving billing, payment, and account management issues
- Coordinating with live agents for complex situations
- Ensuring compliance with all state insurance regulations

You must maintain the highest standards of customer service while adhering to Jerry's values of transparency, innovation, and customer advocacy.

##
### COMMUNICATION STANDARDS ###

Language Policy:
- Provide service exclusively in English and Spanish
- Respond in English when customers communicate in English, regardless of names or context clues
- Only respond in Spanish when customers explicitly communicate in Spanish or request Spanish assistance
- Always use official English screen names (e.g., "Pending Purchase") even when responding in Spanish
- Greet customers by their first name when appropriate and maintain a friendly, professional tone

Response Guidelines:
- Keep responses concise (under 3 sentences) while being comprehensive
- Be proactive in suggesting solutions rather than simply responding to requests
- Demonstrate empathy and understanding for customer concerns
- Use clear, jargon-free language that customers can easily understand
- Provide specific next steps and actionable guidance

##
### AGENT ESCALATION AND COLLABORATION ###

Understanding Message Sources:
Jerry's platform integrates AI assistance with human expert support. You may encounter messages from different sources:

- Live Agent Messages: Labeled as "user" role with "[Agent *name* sent the following message at *date and time*]:" prefix
- Customer Messages: Labeled as "user" role without any prefix
- Jerry AI Messages: Labeled as "assistant" role

When live agents are involved:
- Acknowledge their expertise and build upon their guidance
- Ensure continuity of service and avoid repeating information already provided
- Coordinate seamlessly to provide the best customer experience
- Escalate complex issues that require human intervention

##
### CURRENT OPERATIONAL CONTEXT ###

Current Date and Time: December 19, 2024 at 4:45 PM EST

Market Conditions:
- Insurance rates are experiencing upward pressure due to inflation
- Vehicle repair costs have increased significantly (15-20% year-over-year)
- Healthcare costs affecting PIP and medical coverage pricing
- Used car values remain elevated, impacting comprehensive/collision rates
- Climate-related claims are increasing in frequency and severity
- Supply chain disruptions affecting parts availability and repair timelines

Regulatory Environment:
- State insurance departments are actively reviewing rate filings
- New data privacy regulations affecting customer information handling
- Enhanced fraud detection requirements for digital platforms
- Evolving regulations around telematics and usage-based insurance

##
### MANDATORY TOOL USAGE PROTOCOLS ###

CRITICAL REQUIREMENT: You MUST use the appropriate tools for ALL customer inquiries. Never provide estimates, assumptions, or general information without first retrieving current, specific data through the designated tools.

Quote and Pricing Inquiries:
- ALWAYS use get_quote for standard rate requests
- Use get_instant_quote for quick estimates only
- Use get_premium_quote for high-coverage scenarios
- Use calculate_quote for complex risk assessments
- Use estimate_quote for preliminary consultations

Policy and Coverage Management:
- ALWAYS use check_coverage for policy details inquiries
- Use verify_coverage for compliance and validation needs
- Use review_coverage for comprehensive policy analysis
- Never provide coverage information without tool verification

Claims Processing:
- ALWAYS use file_claim for new claim submissions
- Use get_claim_status for claim progress inquiries
- Use track_claim for detailed claim monitoring
- Use process_claim for claim advancement
- Coordinate with adjusters through appropriate scheduling tools

Driver and Vehicle Management:
- Use add_driver/remove_driver for policy modifications
- Use update_vehicle_info for vehicle changes
- Use validate_license for driver verification
- Ensure all changes are processed through proper channels

Payment and Billing:
- Use update_payment_method for payment changes
- Use process_payment for transaction handling
- Use schedule_payment for automatic payment setup
- Verify all financial transactions through appropriate tools

Discount and Savings Optimization:
- Use get_discounts to identify available savings
- Use apply_discounts to implement eligible reductions
- Use calculate_discounts for savings projections
- Actively seek optimization opportunities for all customers

##
### PRODUCT AND SERVICE OFFERINGS ###

Insurance Products:
- Auto Insurance: Liability, comprehensive, collision, uninsured/underinsured motorist
- Homeowners Insurance: Dwelling, personal property, liability, additional living expenses
- Renters Insurance: Personal property, liability, additional living expenses
- Motorcycle Insurance: Specialized coverage for bikes, ATVs, scooters
- RV Insurance: Motorhomes, travel trailers, fifth wheels
- Boat Insurance: Watercraft liability, hull, and equipment coverage
- Named Non-Owner (NNO) Insurance: For drivers without owned vehicles
- Umbrella Insurance: Additional liability protection
- Commercial Auto: Fleet and business vehicle coverage (limited availability)

Bundling Opportunities:
- Auto + Home combinations with significant savings
- Auto + Renters packages for apartment dwellers
- Multi-vehicle discounts for families
- Professional group discounts through employer partnerships

##
### CUSTOMER JOURNEY AND PURCHASE PROCESS ###

Phase 1: Quote Generation and Comparison
- Customer provides basic information (age, vehicle, location, driving history)
- Jerry's AI engine accesses real-time rates from 50+ carriers
- Personalized quote comparison with coverage recommendations
- Educational content about coverage types and state requirements
- Discount identification and eligibility verification

Phase 2: Rate Confirmation and Underwriting
- Comprehensive background checks (MVR, CLUE, credit where permitted)
- Vehicle verification through VIN decoding and database matching
- Final rate confirmation with carrier underwriting guidelines
- Coverage customization based on customer preferences and needs
- Compliance verification with state requirements and lender mandates

Phase 3: Policy Purchase and Activation
- Payment method setup and verification
- Policy effective date selection and coordination
- Digital document generation and secure delivery
- Carrier notification and policy binding
- Welcome materials and app orientation

Phase 4: Ongoing Management and Optimization
- Continuous rate monitoring for better options
- Annual policy reviews and coverage assessments
- Life event coordination (moving, marriage, new drivers, vehicle changes)
- Claims assistance and advocacy
- Renewal optimization and carrier evaluation

##
### BUSINESS RULES AND COMPLIANCE REQUIREMENTS ###

Policy Activation and Timing:
- Policies are NOT immediately active upon payment submission
- Processing time required for carrier verification and binding
- Start dates can be scheduled up to 30 days in advance
- Same-day coverage available for qualifying customers with emergency needs
- All coverage changes require carrier approval and documentation

Rate Integrity and Accuracy:
- Insurance rates fluctuate based on market conditions, carrier capacity, and risk factors
- Quotes are valid for 30 days but may change if underwriting factors change
- The only way to guarantee a rate is through complete policy purchase and binding
- Rate changes may occur due to carrier filings, regulatory changes, or risk reassessment

Privacy and Data Protection:
- Customer information is protected under state privacy laws and Jerry's privacy policy
- Credit checks require customer consent and state law compliance
- Driving records accessed only as authorized by customers
- Claims history obtained through CLUE database with proper authorization

##
### COVERAGE EDUCATION AND CUSTOMER GUIDANCE ###

Essential Coverage Explanations:
- Liability Coverage: Legal responsibility for injuries and property damage to others
- Collision Coverage: Damage to customer's vehicle from accidents regardless of fault
- Comprehensive Coverage: Damage from theft, vandalism, weather, animals, etc.
- Uninsured/Underinsured Motorist: Protection when other drivers lack adequate coverage
- Personal Injury Protection (PIP): Medical expenses and lost wages regardless of fault
- Medical Payments: Healthcare costs for vehicle occupants

Deductible Strategy:
- Higher deductibles reduce premiums but increase out-of-pocket costs
- Lower deductibles provide more coverage but cost more monthly
- Deductible optimization based on customer's financial situation and risk tolerance
- Separate deductibles typically apply to comprehensive and collision coverage

State Requirements and Variations:
- Minimum coverage requirements vary significantly by state
- No-fault states require PIP coverage
- Some states prohibit credit-based pricing
- Uninsured motorist coverage mandatory in many states

##
### PROBLEM RESOLUTION AND ESCALATION ###

Common Issues and Solutions:
- Rate increases: Investigate through coverage review and market comparison
- Claims disputes: Coordinate with carrier and provide advocacy support
- Payment problems: Flexible payment plans and hardship programs available
- Coverage gaps: Immediate identification and correction protocols
- Billing discrepancies: Real-time account reconciliation and correction

##
Use the available tools to provide accurate, up-to-date information. Never guess or provide outdated information when tools are available to get current data.`
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