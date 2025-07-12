import { errorHandlerService } from "./error-handler.service";

interface GPSCoordinates {
  lat: number;
  lng: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

interface GPSValidationResult extends ValidationResult {
  lat: number;
  lng: number;
  accuracy?: number;
}

class ValidationService {
  private readonly GPS_BOUNDS = {
    UAE: {
      minLat: 22.0,
      maxLat: 26.5,
      minLng: 51.0,
      maxLng: 56.5,
    },
    GLOBAL: {
      minLat: -90,
      maxLat: 90,
      minLng: -180,
      maxLng: 180,
    },
  };

  private readonly VALIDATION_RULES = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[1-9]\d{1,14}$/,
    emiratesId: /^784-\d{4}-\d{7}-\d{1}$/,
    plateNumber: /^[A-Z]{1,3}\s?\d{1,5}$/,
    vehicleVin: /^[A-HJ-NPR-Z0-9]{17}$/,
  };

  async validateGPSCoordinates(
    coordinates: GPSCoordinates,
    options: {
      bounds?: "UAE" | "GLOBAL";
      precision?: number;
      requireAccuracy?: boolean;
    } = {},
  ): Promise<GPSValidationResult> {
    const { bounds = "UAE", precision = 6, requireAccuracy = false } = options;
    const errors: string[] = [];

    try {
      let { lat, lng } = coordinates;

      // Basic type validation
      if (typeof lat !== "number" || typeof lng !== "number") {
        errors.push("Coordinates must be numbers");
        return { isValid: false, errors, lat: 0, lng: 0 };
      }

      // Check for NaN or Infinity
      if (!isFinite(lat) || !isFinite(lng)) {
        errors.push("Coordinates must be finite numbers");
        return { isValid: false, errors, lat: 0, lng: 0 };
      }

      // Precision validation and normalization
      lat = Number(lat.toFixed(precision));
      lng = Number(lng.toFixed(precision));

      // Bounds validation
      const selectedBounds = this.GPS_BOUNDS[bounds];
      if (
        lat < selectedBounds.minLat ||
        lat > selectedBounds.maxLat ||
        lng < selectedBounds.minLng ||
        lng > selectedBounds.maxLng
      ) {
        errors.push(`Coordinates outside ${bounds} bounds`);
      }

      // Additional validation for UAE-specific coordinates
      if (bounds === "UAE") {
        const isValidUAELocation = await this.validateUAELocation(lat, lng);
        if (!isValidUAELocation) {
          errors.push(
            "Coordinates do not appear to be in a valid UAE location",
          );
        }
      }

      // Calculate accuracy if required
      let accuracy: number | undefined;
      if (requireAccuracy) {
        accuracy = await this.calculateGPSAccuracy(lat, lng);
        if (accuracy > 100) {
          // More than 100 meters accuracy
          errors.push("GPS accuracy is insufficient (>100m)");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        lat,
        lng,
        accuracy,
      };
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "ValidationService.validateGPSCoordinates",
        coordinates,
        options,
      });

      return {
        isValid: false,
        errors: ["GPS validation failed due to system error"],
        lat: 0,
        lng: 0,
      };
    }
  }

  validateInput(
    value: any,
    rules: {
      required?: boolean;
      type?:
        | "string"
        | "number"
        | "email"
        | "phone"
        | "emiratesId"
        | "plateNumber"
        | "vehicleVin";
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
      pattern?: RegExp;
      custom?: (value: any) => boolean | string;
    },
  ): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = value;

    try {
      // Required validation
      if (
        rules.required &&
        (value === null || value === undefined || value === "")
      ) {
        errors.push("This field is required");
        return { isValid: false, errors };
      }

      // Skip other validations if value is empty and not required
      if (
        !rules.required &&
        (value === null || value === undefined || value === "")
      ) {
        return { isValid: true, errors: [], sanitizedValue: "" };
      }

      // Type validation and sanitization
      switch (rules.type) {
        case "string":
          sanitizedValue = this.sanitizeString(value);
          break;
        case "number":
          sanitizedValue = this.sanitizeNumber(value);
          if (isNaN(sanitizedValue)) {
            errors.push("Must be a valid number");
          }
          break;
        case "email":
          sanitizedValue = this.sanitizeEmail(value);
          if (!this.VALIDATION_RULES.email.test(sanitizedValue)) {
            errors.push("Must be a valid email address");
          }
          break;
        case "phone":
          sanitizedValue = this.sanitizePhone(value);
          if (!this.VALIDATION_RULES.phone.test(sanitizedValue)) {
            errors.push("Must be a valid phone number");
          }
          break;
        case "emiratesId":
          sanitizedValue = this.sanitizeEmiratesId(value);
          if (!this.VALIDATION_RULES.emiratesId.test(sanitizedValue)) {
            errors.push("Must be a valid Emirates ID (784-XXXX-XXXXXXX-X)");
          }
          break;
        case "plateNumber":
          sanitizedValue = this.sanitizePlateNumber(value);
          if (!this.VALIDATION_RULES.plateNumber.test(sanitizedValue)) {
            errors.push("Must be a valid plate number");
          }
          break;
        case "vehicleVin":
          sanitizedValue = this.sanitizeVehicleVin(value);
          if (!this.VALIDATION_RULES.vehicleVin.test(sanitizedValue)) {
            errors.push("Must be a valid 17-character VIN");
          }
          break;
      }

      // Length validation for strings
      if (typeof sanitizedValue === "string") {
        if (rules.minLength && sanitizedValue.length < rules.minLength) {
          errors.push(`Must be at least ${rules.minLength} characters long`);
        }
        if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
          errors.push(
            `Must be no more than ${rules.maxLength} characters long`,
          );
        }
      }

      // Range validation for numbers
      if (typeof sanitizedValue === "number") {
        if (rules.min !== undefined && sanitizedValue < rules.min) {
          errors.push(`Must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && sanitizedValue > rules.max) {
          errors.push(`Must be no more than ${rules.max}`);
        }
      }

      // Pattern validation
      if (rules.pattern && typeof sanitizedValue === "string") {
        if (!rules.pattern.test(sanitizedValue)) {
          errors.push("Does not match required format");
        }
      }

      // Custom validation
      if (rules.custom) {
        const customResult = rules.custom(sanitizedValue);
        if (typeof customResult === "string") {
          errors.push(customResult);
        } else if (!customResult) {
          errors.push("Custom validation failed");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedValue,
      };
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "ValidationService.validateInput",
        value,
        rules,
      });

      return {
        isValid: false,
        errors: ["Validation failed due to system error"],
      };
    }
  }

  async validateVehicleData(data: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate plate number
    if (!data.plateNumber || data.plateNumber.length < 3) {
      errors.push("Plate number is required and must be at least 3 characters");
    }

    // Validate vehicle type
    const validTypes = ["ambulance", "van", "car", "truck"];
    if (!validTypes.includes(data.type)) {
      errors.push("Invalid vehicle type");
    }

    // Validate capacity
    if (data.capacity && (data.capacity < 1 || data.capacity > 50)) {
      errors.push("Vehicle capacity must be between 1 and 50");
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: {
        plateNumber: this.sanitizePlateNumber(data.plateNumber),
        type: data.type,
        capacity: data.capacity || 4,
        fuelType: data.fuelType || "petrol",
      },
    };
  }

  validateBiometricData(data: {
    template: string;
    score: number;
    method: string;
    deviceId: string;
  }): ValidationResult {
    const errors: string[] = [];

    // Template validation
    if (!data.template || data.template.length < 100) {
      errors.push("Biometric template is invalid or too short");
    }

    // Score validation
    if (data.score < 0 || data.score > 100) {
      errors.push("Biometric score must be between 0 and 100");
    }

    // Method validation
    const validMethods = ["fingerprint", "face", "voice", "iris"];
    if (!validMethods.includes(data.method)) {
      errors.push("Invalid biometric method");
    }

    // Device ID validation
    if (!data.deviceId || data.deviceId.length < 10) {
      errors.push("Device ID is required and must be at least 10 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: {
        template: this.sanitizeString(data.template),
        score: Math.round(data.score * 100) / 100,
        method: data.method.toLowerCase(),
        deviceId: this.sanitizeString(data.deviceId),
      },
    };
  }

  validateVehicleTelemetry(telemetry: {
    speed: number;
    fuelLevel: number;
    engineTemp: number;
    batteryVoltage: number;
    mileage: number;
  }): ValidationResult {
    const errors: string[] = [];

    // Speed validation (0-200 km/h)
    if (telemetry.speed < 0 || telemetry.speed > 200) {
      errors.push("Speed must be between 0 and 200 km/h");
    }

    // Fuel level validation (0-100%)
    if (telemetry.fuelLevel < 0 || telemetry.fuelLevel > 100) {
      errors.push("Fuel level must be between 0 and 100%");
    }

    // Engine temperature validation (-40 to 150°C)
    if (telemetry.engineTemp < -40 || telemetry.engineTemp > 150) {
      errors.push("Engine temperature must be between -40 and 150°C");
    }

    // Battery voltage validation (10-15V)
    if (telemetry.batteryVoltage < 10 || telemetry.batteryVoltage > 15) {
      errors.push("Battery voltage must be between 10 and 15V");
    }

    // Mileage validation (non-negative)
    if (telemetry.mileage < 0) {
      errors.push("Mileage cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: {
        speed: Math.round(telemetry.speed * 10) / 10,
        fuelLevel: Math.round(telemetry.fuelLevel * 10) / 10,
        engineTemp: Math.round(telemetry.engineTemp * 10) / 10,
        batteryVoltage: Math.round(telemetry.batteryVoltage * 100) / 100,
        mileage: Math.round(telemetry.mileage),
      },
    };
  }

  // Private sanitization methods
  private sanitizeString(value: any): string {
    if (typeof value !== "string") {
      value = String(value);
    }

    return value
      .trim()
      .replace(/[<>"'&]/g, "") // Remove potentially dangerous characters
      .replace(/\s+/g, " "); // Normalize whitespace
  }

  private sanitizeNumber(value: any): number {
    if (typeof value === "number") {
      return value;
    }

    const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }

  private sanitizeEmail(value: any): string {
    return this.sanitizeString(value).toLowerCase();
  }

  private sanitizePhone(value: any): string {
    return this.sanitizeString(value).replace(/[^+0-9]/g, "");
  }

  private sanitizeEmiratesId(value: any): string {
    const cleaned = this.sanitizeString(value).replace(/[^0-9-]/g, "");
    // Format as 784-XXXX-XXXXXXX-X if not already formatted
    if (cleaned.length === 15 && !cleaned.includes("-")) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 14)}-${cleaned.slice(14)}`;
    }
    return cleaned;
  }

  private sanitizePlateNumber(value: any): string {
    return this.sanitizeString(value)
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "");
  }

  private sanitizeVehicleVin(value: any): string {
    return this.sanitizeString(value)
      .toUpperCase()
      .replace(/[^A-HJ-NPR-Z0-9]/g, "");
  }

  // Helper methods
  private async validateUAELocation(
    lat: number,
    lng: number,
  ): Promise<boolean> {
    // In production, this would check against known UAE locations/boundaries
    // For now, we'll do basic bounds checking
    const uaeBounds = this.GPS_BOUNDS.UAE;
    return (
      lat >= uaeBounds.minLat &&
      lat <= uaeBounds.maxLat &&
      lng >= uaeBounds.minLng &&
      lng <= uaeBounds.maxLng
    );
  }

  private async calculateGPSAccuracy(
    lat: number,
    lng: number,
  ): Promise<number> {
    // In production, this would calculate actual GPS accuracy
    // For now, return a simulated accuracy value
    return Math.random() * 50 + 10; // 10-60 meters
  }

  // Batch validation methods
  async validateBatch<T>(
    items: T[],
    validator: (item: T) => ValidationResult | Promise<ValidationResult>,
  ): Promise<{
    valid: T[];
    invalid: { item: T; errors: string[] }[];
    summary: { total: number; valid: number; invalid: number };
  }> {
    const valid: T[] = [];
    const invalid: { item: T; errors: string[] }[] = [];

    for (const item of items) {
      try {
        const result = await validator(item);
        if (result.isValid) {
          valid.push(result.sanitizedValue || item);
        } else {
          invalid.push({ item, errors: result.errors });
        }
      } catch (error) {
        invalid.push({ item, errors: ["Validation error occurred"] });
      }
    }

    return {
      valid,
      invalid,
      summary: {
        total: items.length,
        valid: valid.length,
        invalid: invalid.length,
      },
    };
  }

  // Schema validation for complex objects
  validateSchema(data: any, schema: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    const sanitizedValue: any = {};

    try {
      for (const [key, rules] of Object.entries(schema)) {
        const fieldValue = data[key];
        const fieldResult = this.validateInput(fieldValue, rules);

        if (!fieldResult.isValid) {
          errors.push(...fieldResult.errors.map((error) => `${key}: ${error}`));
        } else {
          sanitizedValue[key] = fieldResult.sanitizedValue;
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedValue,
      };
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "ValidationService.validateSchema",
        data,
        schema,
      });

      return {
        isValid: false,
        errors: ["Schema validation failed due to system error"],
      };
    }
  }
}

export const validationService = new ValidationService();
