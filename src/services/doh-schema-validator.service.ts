/**
 * DOH Schema Validator Service
 *
 * This service validates data against DOH-compliant schemas to ensure
 * all submissions and records meet regulatory requirements.
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export class DOHSchemaValidatorService {
  /**
   * Validate data against a specified schema
   *
   * @param data The data to validate
   * @param schemaType The type of schema to validate against
   * @returns Validation result with any errors
   */
  validateSchema(data: any, schemaType: string): ValidationResult {
    try {
      // In a real implementation, this would use a schema validation library
      // like Joi, Yup, or JSON Schema validator

      switch (schemaType) {
        case "patient":
          return this.validatePatientSchema(data);

        case "clinicalAssessment":
          return this.validateClinicalAssessmentSchema(data);

        case "medication":
          return this.validateMedicationSchema(data);

        case "episode":
          return this.validateEpisodeSchema(data);

        default:
          throw new Error(`Unknown schema type: ${schemaType}`);
      }
    } catch (error) {
      console.error("Schema validation error:", error);
      return {
        valid: false,
        errors: [{ field: "general", message: (error as Error).message }],
      };
    }
  }

  /**
   * Validate a patient record against the DOH patient schema
   *
   * @param data The patient data to validate
   * @returns Validation result
   */
  private validatePatientSchema(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Check required fields
    if (!data.id)
      errors.push({ field: "id", message: "Patient ID is required" });
    if (!data.emiratesId)
      errors.push({ field: "emiratesId", message: "Emirates ID is required" });
    if (!data.firstName)
      errors.push({ field: "firstName", message: "First name is required" });
    if (!data.lastName)
      errors.push({ field: "lastName", message: "Last name is required" });
    if (!data.dateOfBirth)
      errors.push({
        field: "dateOfBirth",
        message: "Date of birth is required",
      });
    if (!data.gender)
      errors.push({ field: "gender", message: "Gender is required" });

    // Validate Emirates ID format (784-YYYY-NNNNNNN-C)
    if (data.emiratesId && !/^784-\d{4}-\d{7}-\d$/.test(data.emiratesId)) {
      errors.push({
        field: "emiratesId",
        message: "Invalid Emirates ID format",
      });
    }

    // Validate date of birth format (YYYY-MM-DD)
    if (data.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth)) {
      errors.push({
        field: "dateOfBirth",
        message: "Invalid date of birth format (YYYY-MM-DD)",
      });
    }

    // Validate gender values
    if (
      data.gender &&
      !["male", "female", "other"].includes(data.gender.toLowerCase())
    ) {
      errors.push({
        field: "gender",
        message: "Gender must be one of: male, female, other",
      });
    }

    // Validate contact number format
    if (data.contactNumber && !/^\+?[0-9]{10,15}$/.test(data.contactNumber)) {
      errors.push({
        field: "contactNumber",
        message: "Invalid contact number format",
      });
    }

    // Validate email format
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a clinical assessment against the DOH clinical assessment schema
   *
   * @param data The clinical assessment data to validate
   * @returns Validation result
   */
  private validateClinicalAssessmentSchema(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Check required fields
    if (!data.id)
      errors.push({ field: "id", message: "Assessment ID is required" });
    if (!data.patientId)
      errors.push({ field: "patientId", message: "Patient ID is required" });
    if (!data.assessmentDate)
      errors.push({
        field: "assessmentDate",
        message: "Assessment date is required",
      });
    if (!data.clinicianId)
      errors.push({
        field: "clinicianId",
        message: "Clinician ID is required",
      });
    if (!data.clinicianName)
      errors.push({
        field: "clinicianName",
        message: "Clinician name is required",
      });
    if (!data.clinicianSignature)
      errors.push({
        field: "clinicianSignature",
        message: "Clinician signature is required for DOH compliance",
      });

    // Validate assessment type
    if (
      data.assessmentType &&
      !["initial", "follow-up", "discharge"].includes(data.assessmentType)
    ) {
      errors.push({
        field: "assessmentType",
        message:
          "Assessment type must be one of: initial, follow-up, discharge",
      });
    }

    // Check for required domains (DOH requires 9 domains)
    const requiredDomains = [
      "physical",
      "functional",
      "psychological",
      "social",
      "environmental",
      "spiritual",
      "nutritional",
      "pain",
      "medication",
    ];

    if (!data.domains || !Array.isArray(data.domains)) {
      errors.push({
        field: "domains",
        message: "Assessment domains are required",
      });
    } else if (data.domains.length < requiredDomains.length) {
      errors.push({
        field: "domains",
        message: "All 9 DOH assessment domains are required",
      });
    } else {
      // Check that all required domains are present
      const domainTypes = data.domains.map((domain: any) => domain.domain);
      const missingDomains = requiredDomains.filter(
        (domain) => !domainTypes.includes(domain),
      );

      if (missingDomains.length > 0) {
        errors.push({
          field: "domains",
          message: `Missing required domains: ${missingDomains.join(", ")}`,
        });
      }

      // Validate each domain has required fields
      data.domains.forEach((domain: any, index: number) => {
        if (!domain.domain) {
          errors.push({
            field: `domains[${index}].domain`,
            message: "Domain type is required",
          });
        }
        if (!domain.findings) {
          errors.push({
            field: `domains[${index}].findings`,
            message: "Domain findings are required",
          });
        }
        if (domain.score === undefined || domain.score === null) {
          errors.push({
            field: `domains[${index}].score`,
            message: "Domain score is required",
          });
        } else if (domain.score < 1 || domain.score > 5) {
          errors.push({
            field: `domains[${index}].score`,
            message: "Domain score must be between 1 and 5",
          });
        }
      });
    }

    // Validate total score if present
    if (data.totalScore !== undefined && data.totalScore !== null) {
      const calculatedTotal =
        data.domains?.reduce(
          (sum: number, domain: any) => sum + (domain.score || 0),
          0,
        ) || 0;
      if (data.totalScore !== calculatedTotal) {
        errors.push({
          field: "totalScore",
          message: `Total score (${data.totalScore}) does not match sum of domain scores (${calculatedTotal})`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate medication data against the DOH medication schema
   *
   * @param data The medication data to validate
   * @returns Validation result
   */
  private validateMedicationSchema(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Check required fields
    if (!data.id)
      errors.push({ field: "id", message: "Medication ID is required" });
    if (!data.patientId)
      errors.push({ field: "patientId", message: "Patient ID is required" });
    if (!data.name)
      errors.push({ field: "name", message: "Medication name is required" });
    if (!data.dosage)
      errors.push({ field: "dosage", message: "Dosage is required" });
    if (!data.frequency)
      errors.push({ field: "frequency", message: "Frequency is required" });
    if (!data.route)
      errors.push({
        field: "route",
        message: "Administration route is required",
      });
    if (!data.prescribedBy)
      errors.push({
        field: "prescribedBy",
        message: "Prescriber information is required",
      });
    if (!data.prescriptionDate)
      errors.push({
        field: "prescriptionDate",
        message: "Prescription date is required",
      });

    // Validate route
    const validRoutes = [
      "oral",
      "intravenous",
      "intramuscular",
      "subcutaneous",
      "topical",
      "inhalation",
      "rectal",
      "other",
    ];
    if (data.route && !validRoutes.includes(data.route.toLowerCase())) {
      errors.push({
        field: "route",
        message: `Invalid route. Must be one of: ${validRoutes.join(", ")}`,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate episode data against the DOH episode schema
   *
   * @param data The episode data to validate
   * @returns Validation result
   */
  private validateEpisodeSchema(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Check required fields
    if (!data.id)
      errors.push({ field: "id", message: "Episode ID is required" });
    if (!data.patientId)
      errors.push({ field: "patientId", message: "Patient ID is required" });
    if (!data.startDate)
      errors.push({ field: "startDate", message: "Start date is required" });
    if (!data.careType)
      errors.push({ field: "careType", message: "Care type is required" });
    if (!data.primaryDiagnosis)
      errors.push({
        field: "primaryDiagnosis",
        message: "Primary diagnosis is required",
      });
    if (!data.referringPhysician)
      errors.push({
        field: "referringPhysician",
        message: "Referring physician is required",
      });

    // Validate care type
    const validCareTypes = [
      "skilled nursing",
      "physical therapy",
      "occupational therapy",
      "speech therapy",
      "medical social services",
      "home health aide",
      "other",
    ];
    if (
      data.careType &&
      !validCareTypes.includes(data.careType.toLowerCase())
    ) {
      errors.push({
        field: "careType",
        message: `Invalid care type. Must be one of: ${validCareTypes.join(", ")}`,
      });
    }

    // Validate dates
    if (
      data.startDate &&
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(
        data.startDate,
      )
    ) {
      errors.push({
        field: "startDate",
        message: "Invalid start date format (ISO 8601)",
      });
    }

    if (data.endDate) {
      if (
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(
          data.endDate,
        )
      ) {
        errors.push({
          field: "endDate",
          message: "Invalid end date format (ISO 8601)",
        });
      }

      // Ensure end date is after start date if both are present
      if (
        data.startDate &&
        new Date(data.endDate) <= new Date(data.startDate)
      ) {
        errors.push({
          field: "endDate",
          message: "End date must be after start date",
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
