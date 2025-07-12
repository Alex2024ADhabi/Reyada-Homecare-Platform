import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// Mock components for testing
const MockPatientManagement = ({
  onPatientSelect = vi.fn(),
  patients = [],
}) => {
  return (
    <div data-testid="patient-management">
      <h1>Patient Management</h1>
      <button
        data-testid="add-patient-btn"
        onClick={() => onPatientSelect({ id: "new", name: "New Patient" })}
      >
        Add Patient
      </button>
      <div data-testid="patient-list">
        {patients.map((patient: any) => (
          <div key={patient.id} data-testid={`patient-${patient.id}`}>
            {patient.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const MockClinicalDocumentation = ({
  patientId = "patient-123",
  onSave = vi.fn(),
  onValidate = vi.fn(),
}) => {
  const [formData, setFormData] = React.useState({
    assessment: "",
    notes: "",
    signature: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onValidate(formData);
    onSave(formData);
  };

  return (
    <div data-testid="clinical-documentation">
      <h2>Clinical Documentation</h2>
      <form onSubmit={handleSubmit} data-testid="clinical-form">
        <textarea
          data-testid="assessment-field"
          value={formData.assessment}
          onChange={(e) =>
            setFormData({ ...formData, assessment: e.target.value })
          }
          placeholder="9-Domain Assessment"
          aria-label="Clinical Assessment"
        />
        <textarea
          data-testid="notes-field"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Clinical Notes"
          aria-label="Clinical Notes"
        />
        <input
          data-testid="signature-field"
          type="text"
          value={formData.signature}
          onChange={(e) =>
            setFormData({ ...formData, signature: e.target.value })
          }
          placeholder="Digital Signature"
          aria-label="Digital Signature"
        />
        <button type="submit" data-testid="save-btn">
          Save Documentation
        </button>
      </form>
    </div>
  );
};

const MockComplianceChecker = ({
  data = {},
  onComplianceCheck = vi.fn(),
  complianceRules = [],
}) => {
  const [complianceStatus, setComplianceStatus] = React.useState("pending");
  const [violations, setViolations] = React.useState([]);

  const checkCompliance = () => {
    const result = onComplianceCheck(data);
    setComplianceStatus(result.status || "compliant");
    setViolations(result.violations || []);
  };

  return (
    <div data-testid="compliance-checker">
      <h3>DOH Compliance Checker</h3>
      <button data-testid="check-compliance-btn" onClick={checkCompliance}>
        Check Compliance
      </button>
      <div data-testid="compliance-status" data-status={complianceStatus}>
        Status: {complianceStatus}
      </div>
      {violations.length > 0 && (
        <div data-testid="compliance-violations">
          {violations.map((violation: any, index: number) => (
            <div key={index} data-testid={`violation-${index}`}>
              {violation.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MockDamanSubmissionForm = ({
  onSubmit = vi.fn(),
  onValidate = vi.fn(),
  initialData = {},
}) => {
  const [formData, setFormData] = React.useState({
    patientId: "",
    serviceType: "",
    authorizationNumber: "",
    documents: [],
    ...initialData,
  });
  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationResult = onValidate(formData);
    if (validationResult.errors) {
      setErrors(validationResult.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="daman-submission-form">
      <h2>Daman Authorization Submission</h2>
      <form onSubmit={handleSubmit} data-testid="daman-form">
        <input
          data-testid="patient-id-field"
          type="text"
          value={formData.patientId}
          onChange={(e) =>
            setFormData({ ...formData, patientId: e.target.value })
          }
          placeholder="Patient ID"
          aria-label="Patient ID"
        />
        <select
          data-testid="service-type-field"
          value={formData.serviceType}
          onChange={(e) =>
            setFormData({ ...formData, serviceType: e.target.value })
          }
          aria-label="Service Type"
        >
          <option value="">Select Service Type</option>
          <option value="nursing">Nursing Care</option>
          <option value="physiotherapy">Physiotherapy</option>
          <option value="homecare">Home Care</option>
        </select>
        <input
          data-testid="auth-number-field"
          type="text"
          value={formData.authorizationNumber}
          onChange={(e) =>
            setFormData({ ...formData, authorizationNumber: e.target.value })
          }
          placeholder="Authorization Number"
          aria-label="Authorization Number"
        />
        {Object.entries(errors).map(([field, error]) => (
          <div key={field} data-testid={`error-${field}`} role="alert">
            {error as string}
          </div>
        ))}
        <button type="submit" data-testid="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Authorization"}
        </button>
      </form>
    </div>
  );
};

const MockErrorBoundary = ({ children, onError = vi.fn() }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
      onError(event.error);
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, [onError]);

  if (hasError) {
    return (
      <div data-testid="error-boundary">
        <h2>Something went wrong</h2>
        <p data-testid="error-message">{error?.message || "Unknown error"}</p>
        <button
          data-testid="retry-btn"
          onClick={() => {
            setHasError(false);
            setError(null);
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

describe("Comprehensive Component Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Patient Management Component", () => {
    it("should render patient management interface correctly", () => {
      const mockPatients = [
        { id: "1", name: "Ahmed Al Mansouri" },
        { id: "2", name: "Fatima Al Zahra" },
      ];

      render(<MockPatientManagement patients={mockPatients} />);

      expect(screen.getByTestId("patient-management")).toBeInTheDocument();
      expect(screen.getByText("Patient Management")).toBeInTheDocument();
      expect(screen.getByTestId("add-patient-btn")).toBeInTheDocument();
      expect(screen.getByTestId("patient-1")).toHaveTextContent(
        "Ahmed Al Mansouri",
      );
      expect(screen.getByTestId("patient-2")).toHaveTextContent(
        "Fatima Al Zahra",
      );
    });

    it("should handle patient selection", async () => {
      const mockOnPatientSelect = vi.fn();
      render(<MockPatientManagement onPatientSelect={mockOnPatientSelect} />);

      const addButton = screen.getByTestId("add-patient-btn");
      await userEvent.click(addButton);

      expect(mockOnPatientSelect).toHaveBeenCalledWith({
        id: "new",
        name: "New Patient",
      });
    });

    it("should be accessible", async () => {
      const { container } = render(<MockPatientManagement />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should handle empty patient list", () => {
      render(<MockPatientManagement patients={[]} />);

      const patientList = screen.getByTestId("patient-list");
      expect(patientList).toBeEmptyDOMElement();
    });

    it("should support keyboard navigation", async () => {
      render(<MockPatientManagement />);

      const addButton = screen.getByTestId("add-patient-btn");
      addButton.focus();

      expect(addButton).toHaveFocus();

      await userEvent.keyboard("{Enter}");
      // Button should be clickable via keyboard
    });
  });

  describe("Clinical Documentation Component", () => {
    it("should render clinical documentation form", () => {
      render(<MockClinicalDocumentation />);

      expect(screen.getByTestId("clinical-documentation")).toBeInTheDocument();
      expect(screen.getByTestId("assessment-field")).toBeInTheDocument();
      expect(screen.getByTestId("notes-field")).toBeInTheDocument();
      expect(screen.getByTestId("signature-field")).toBeInTheDocument();
      expect(screen.getByTestId("save-btn")).toBeInTheDocument();
    });

    it("should handle form input changes", async () => {
      render(<MockClinicalDocumentation />);

      const assessmentField = screen.getByTestId("assessment-field");
      const notesField = screen.getByTestId("notes-field");
      const signatureField = screen.getByTestId("signature-field");

      await userEvent.type(assessmentField, "Patient assessment completed");
      await userEvent.type(notesField, "Clinical notes documented");
      await userEvent.type(signatureField, "Dr. Sarah Ahmed");

      expect(assessmentField).toHaveValue("Patient assessment completed");
      expect(notesField).toHaveValue("Clinical notes documented");
      expect(signatureField).toHaveValue("Dr. Sarah Ahmed");
    });

    it("should handle form submission", async () => {
      const mockOnSave = vi.fn();
      const mockOnValidate = vi.fn().mockReturnValue({ valid: true });

      render(
        <MockClinicalDocumentation
          onSave={mockOnSave}
          onValidate={mockOnValidate}
        />,
      );

      const assessmentField = screen.getByTestId("assessment-field");
      const saveButton = screen.getByTestId("save-btn");

      await userEvent.type(assessmentField, "Test assessment");
      await userEvent.click(saveButton);

      expect(mockOnValidate).toHaveBeenCalled();
      expect(mockOnSave).toHaveBeenCalledWith({
        assessment: "Test assessment",
        notes: "",
        signature: "",
      });
    });

    it("should have proper ARIA labels", () => {
      render(<MockClinicalDocumentation />);

      expect(screen.getByLabelText("Clinical Assessment")).toBeInTheDocument();
      expect(screen.getByLabelText("Clinical Notes")).toBeInTheDocument();
      expect(screen.getByLabelText("Digital Signature")).toBeInTheDocument();
    });

    it("should be accessible", async () => {
      const { container } = render(<MockClinicalDocumentation />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Compliance Checker Component", () => {
    it("should render compliance checker interface", () => {
      render(<MockComplianceChecker />);

      expect(screen.getByTestId("compliance-checker")).toBeInTheDocument();
      expect(screen.getByText("DOH Compliance Checker")).toBeInTheDocument();
      expect(screen.getByTestId("check-compliance-btn")).toBeInTheDocument();
      expect(screen.getByTestId("compliance-status")).toBeInTheDocument();
    });

    it("should handle compliance checking", async () => {
      const mockOnComplianceCheck = vi.fn().mockReturnValue({
        status: "compliant",
        violations: [],
      });

      render(
        <MockComplianceChecker
          onComplianceCheck={mockOnComplianceCheck}
          data={{ patientId: "patient-123" }}
        />,
      );

      const checkButton = screen.getByTestId("check-compliance-btn");
      await userEvent.click(checkButton);

      expect(mockOnComplianceCheck).toHaveBeenCalledWith({
        patientId: "patient-123",
      });
      expect(screen.getByTestId("compliance-status")).toHaveTextContent(
        "Status: compliant",
      );
    });

    it("should display compliance violations", async () => {
      const mockOnComplianceCheck = vi.fn().mockReturnValue({
        status: "non-compliant",
        violations: [
          { message: "Missing required field: Emirates ID" },
          { message: "Invalid service code format" },
        ],
      });

      render(
        <MockComplianceChecker onComplianceCheck={mockOnComplianceCheck} />,
      );

      const checkButton = screen.getByTestId("check-compliance-btn");
      await userEvent.click(checkButton);

      expect(screen.getByTestId("compliance-violations")).toBeInTheDocument();
      expect(screen.getByTestId("violation-0")).toHaveTextContent(
        "Missing required field: Emirates ID",
      );
      expect(screen.getByTestId("violation-1")).toHaveTextContent(
        "Invalid service code format",
      );
    });

    it("should update compliance status dynamically", async () => {
      const mockOnComplianceCheck = vi
        .fn()
        .mockReturnValueOnce({ status: "pending", violations: [] })
        .mockReturnValueOnce({ status: "compliant", violations: [] });

      render(
        <MockComplianceChecker onComplianceCheck={mockOnComplianceCheck} />,
      );

      const checkButton = screen.getByTestId("check-compliance-btn");
      const statusElement = screen.getByTestId("compliance-status");

      expect(statusElement).toHaveTextContent("Status: pending");

      await userEvent.click(checkButton);
      expect(statusElement).toHaveTextContent("Status: pending");

      await userEvent.click(checkButton);
      expect(statusElement).toHaveTextContent("Status: compliant");
    });
  });

  describe("Daman Submission Form Component", () => {
    it("should render Daman submission form", () => {
      render(<MockDamanSubmissionForm />);

      expect(screen.getByTestId("daman-submission-form")).toBeInTheDocument();
      expect(
        screen.getByText("Daman Authorization Submission"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("patient-id-field")).toBeInTheDocument();
      expect(screen.getByTestId("service-type-field")).toBeInTheDocument();
      expect(screen.getByTestId("auth-number-field")).toBeInTheDocument();
      expect(screen.getByTestId("submit-btn")).toBeInTheDocument();
    });

    it("should handle form input changes", async () => {
      render(<MockDamanSubmissionForm />);

      const patientIdField = screen.getByTestId("patient-id-field");
      const serviceTypeField = screen.getByTestId("service-type-field");
      const authNumberField = screen.getByTestId("auth-number-field");

      await userEvent.type(patientIdField, "patient-123");
      await userEvent.selectOptions(serviceTypeField, "nursing");
      await userEvent.type(authNumberField, "AUTH-456789");

      expect(patientIdField).toHaveValue("patient-123");
      expect(serviceTypeField).toHaveValue("nursing");
      expect(authNumberField).toHaveValue("AUTH-456789");
    });

    it("should handle form validation errors", async () => {
      const mockOnValidate = vi.fn().mockReturnValue({
        errors: {
          patientId: "Patient ID is required",
          serviceType: "Service type must be selected",
        },
      });

      render(
        <MockDamanSubmissionForm
          onValidate={mockOnValidate}
          onSubmit={vi.fn()}
        />,
      );

      const submitButton = screen.getByTestId("submit-btn");
      await userEvent.click(submitButton);

      expect(screen.getByTestId("error-patientId")).toHaveTextContent(
        "Patient ID is required",
      );
      expect(screen.getByTestId("error-serviceType")).toHaveTextContent(
        "Service type must be selected",
      );
    });

    it("should handle successful form submission", async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true });
      const mockOnValidate = vi.fn().mockReturnValue({ valid: true });

      render(
        <MockDamanSubmissionForm
          onSubmit={mockOnSubmit}
          onValidate={mockOnValidate}
        />,
      );

      const patientIdField = screen.getByTestId("patient-id-field");
      const submitButton = screen.getByTestId("submit-btn");

      await userEvent.type(patientIdField, "patient-123");
      await userEvent.click(submitButton);

      expect(mockOnValidate).toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalledWith({
        patientId: "patient-123",
        serviceType: "",
        authorizationNumber: "",
        documents: [],
      });
    });

    it("should show loading state during submission", async () => {
      const mockOnSubmit = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );
      const mockOnValidate = vi.fn().mockReturnValue({ valid: true });

      render(
        <MockDamanSubmissionForm
          onSubmit={mockOnSubmit}
          onValidate={mockOnValidate}
        />,
      );

      const submitButton = screen.getByTestId("submit-btn");
      await userEvent.click(submitButton);

      expect(submitButton).toHaveTextContent("Submitting...");
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(submitButton).toHaveTextContent("Submit Authorization");
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("should be accessible", async () => {
      const { container } = render(<MockDamanSubmissionForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Error Boundary Component", () => {
    it("should render children when no error occurs", () => {
      render(
        <MockErrorBoundary>
          <div data-testid="child-component">Child Content</div>
        </MockErrorBoundary>,
      );

      expect(screen.getByTestId("child-component")).toBeInTheDocument();
      expect(screen.getByText("Child Content")).toBeInTheDocument();
    });

    it("should catch and display errors", async () => {
      const mockOnError = vi.fn();
      const ThrowError = () => {
        throw new Error("Test error message");
      };

      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MockErrorBoundary onError={mockOnError}>
          <ThrowError />
        </MockErrorBoundary>,
      );

      // Simulate error event
      const errorEvent = new ErrorEvent("error", {
        error: new Error("Test error message"),
        message: "Test error message",
      });
      window.dispatchEvent(errorEvent);

      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(screen.getByTestId("error-message")).toHaveTextContent(
          "Test error message",
        );
        expect(screen.getByTestId("retry-btn")).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it("should allow error recovery", async () => {
      const mockOnError = vi.fn();

      render(
        <MockErrorBoundary onError={mockOnError}>
          <div data-testid="child-component">Child Content</div>
        </MockErrorBoundary>,
      );

      // Simulate error
      const errorEvent = new ErrorEvent("error", {
        error: new Error("Test error"),
        message: "Test error",
      });
      window.dispatchEvent(errorEvent);

      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByTestId("retry-btn");
      await userEvent.click(retryButton);

      expect(screen.getByTestId("child-component")).toBeInTheDocument();
      expect(screen.queryByTestId("error-boundary")).not.toBeInTheDocument();
    });
  });

  describe("Component Integration Tests", () => {
    it("should integrate patient management with clinical documentation", async () => {
      const mockOnPatientSelect = vi.fn();
      const mockOnSave = vi.fn();

      const IntegratedComponent = () => {
        const [selectedPatient, setSelectedPatient] = React.useState(null);

        const handlePatientSelect = (patient: any) => {
          setSelectedPatient(patient);
          mockOnPatientSelect(patient);
        };

        return (
          <div>
            <MockPatientManagement onPatientSelect={handlePatientSelect} />
            {selectedPatient && (
              <MockClinicalDocumentation
                patientId={selectedPatient.id}
                onSave={mockOnSave}
              />
            )}
          </div>
        );
      };

      render(<IntegratedComponent />);

      const addPatientButton = screen.getByTestId("add-patient-btn");
      await userEvent.click(addPatientButton);

      expect(mockOnPatientSelect).toHaveBeenCalled();
      expect(screen.getByTestId("clinical-documentation")).toBeInTheDocument();

      const assessmentField = screen.getByTestId("assessment-field");
      const saveButton = screen.getByTestId("save-btn");

      await userEvent.type(assessmentField, "Integrated assessment");
      await userEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalled();
    });

    it("should integrate compliance checking with form submission", async () => {
      const mockOnComplianceCheck = vi.fn().mockReturnValue({
        status: "compliant",
        violations: [],
      });
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true });

      const IntegratedComponent = () => {
        const [isCompliant, setIsCompliant] = React.useState(false);

        const handleComplianceCheck = (data: any) => {
          const result = mockOnComplianceCheck(data);
          setIsCompliant(result.status === "compliant");
          return result;
        };

        return (
          <div>
            <MockComplianceChecker
              onComplianceCheck={handleComplianceCheck}
              data={{ patientId: "patient-123" }}
            />
            <MockDamanSubmissionForm
              onSubmit={mockOnSubmit}
              onValidate={() => ({ valid: isCompliant })}
            />
          </div>
        );
      };

      render(<IntegratedComponent />);

      const checkComplianceButton = screen.getByTestId("check-compliance-btn");
      await userEvent.click(checkComplianceButton);

      expect(mockOnComplianceCheck).toHaveBeenCalled();

      const submitButton = screen.getByTestId("submit-btn");
      await userEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe("Performance Tests", () => {
    it("should render large patient lists efficiently", () => {
      const largePatientList = Array.from({ length: 1000 }, (_, i) => ({
        id: `patient-${i}`,
        name: `Patient ${i}`,
      }));

      const startTime = performance.now();
      render(<MockPatientManagement patients={largePatientList} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render in under 1 second
      expect(screen.getByTestId("patient-management")).toBeInTheDocument();
    });

    it("should handle rapid form input changes", async () => {
      render(<MockClinicalDocumentation />);

      const assessmentField = screen.getByTestId("assessment-field");

      const startTime = performance.now();

      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        await userEvent.type(assessmentField, `Text ${i} `);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should handle rapid input
      expect(assessmentField).toHaveValue(expect.stringContaining("Text 99"));
    });
  });

  describe("Accessibility Tests", () => {
    it("should support screen reader navigation", () => {
      render(<MockClinicalDocumentation />);

      const form = screen.getByTestId("clinical-form");
      const assessmentField = screen.getByLabelText("Clinical Assessment");
      const notesField = screen.getByLabelText("Clinical Notes");
      const signatureField = screen.getByLabelText("Digital Signature");

      expect(form).toBeInTheDocument();
      expect(assessmentField).toHaveAttribute(
        "aria-label",
        "Clinical Assessment",
      );
      expect(notesField).toHaveAttribute("aria-label", "Clinical Notes");
      expect(signatureField).toHaveAttribute("aria-label", "Digital Signature");
    });

    it("should provide proper error announcements", async () => {
      const mockOnValidate = vi.fn().mockReturnValue({
        errors: { patientId: "Patient ID is required" },
      });

      render(<MockDamanSubmissionForm onValidate={mockOnValidate} />);

      const submitButton = screen.getByTestId("submit-btn");
      await userEvent.click(submitButton);

      const errorElement = screen.getByTestId("error-patientId");
      expect(errorElement).toHaveAttribute("role", "alert");
      expect(errorElement).toHaveTextContent("Patient ID is required");
    });

    it("should support keyboard-only navigation", async () => {
      render(<MockDamanSubmissionForm />);

      const patientIdField = screen.getByTestId("patient-id-field");
      const serviceTypeField = screen.getByTestId("service-type-field");
      const submitButton = screen.getByTestId("submit-btn");

      // Tab through form elements
      await userEvent.tab();
      expect(patientIdField).toHaveFocus();

      await userEvent.tab();
      expect(serviceTypeField).toHaveFocus();

      await userEvent.tab();
      await userEvent.tab(); // Skip auth number field
      expect(submitButton).toHaveFocus();
    });
  });

  describe("Error Handling Tests", () => {
    it("should handle network errors gracefully", async () => {
      const mockOnSubmit = vi
        .fn()
        .mockRejectedValue(new Error("Network error"));
      const mockOnValidate = vi.fn().mockReturnValue({ valid: true });

      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <MockDamanSubmissionForm
          onSubmit={mockOnSubmit}
          onValidate={mockOnValidate}
        />,
      );

      const submitButton = screen.getByTestId("submit-btn");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent("Submit Authorization");
      });

      consoleSpy.mockRestore();
    });

    it("should validate required fields", async () => {
      const mockOnValidate = vi.fn().mockImplementation((data) => {
        const errors: any = {};
        if (!data.patientId) errors.patientId = "Patient ID is required";
        if (!data.serviceType) errors.serviceType = "Service type is required";
        return Object.keys(errors).length > 0 ? { errors } : { valid: true };
      });

      render(<MockDamanSubmissionForm onValidate={mockOnValidate} />);

      const submitButton = screen.getByTestId("submit-btn");
      await userEvent.click(submitButton);

      expect(screen.getByTestId("error-patientId")).toBeInTheDocument();
      expect(screen.getByTestId("error-serviceType")).toBeInTheDocument();
    });
  });
});
