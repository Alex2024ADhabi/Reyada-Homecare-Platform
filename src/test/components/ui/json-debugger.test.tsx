import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JsonDebugger from "@/components/ui/json-debugger";
import { ToastProvider } from "@/components/ui/toast-provider";

// Mock the toast context
const mockToast = vi.fn();
vi.mock("@/components/ui/toast-provider", async () => {
  const actual = await vi.importActual("@/components/ui/toast-provider");
  return {
    ...actual,
    useToastContext: () => ({ toast: mockToast }),
  };
});

const renderWithToast = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe("JsonDebugger", () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it("should render with initial state", () => {
    renderWithToast(<JsonDebugger />);

    expect(screen.getByText("JSON Debugger & Validator")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Paste your JSON here..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Validate JSON")).toBeInTheDocument();
  });

  it("should render with initial JSON", () => {
    const initialJson = '{"test": "value"}';
    renderWithToast(<JsonDebugger initialJson={initialJson} />);

    const textarea = screen.getByPlaceholderText("Paste your JSON here...");
    expect(textarea).toHaveValue(initialJson);
  });

  it("should validate correct JSON", async () => {
    const user = userEvent.setup();
    renderWithToast(<JsonDebugger />);

    const textarea = screen.getByPlaceholderText("Paste your JSON here...");
    const validateButton = screen.getByText("Validate JSON");

    await user.type(textarea, '{"name": "test", "value": 123}');
    await user.click(validateButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "✅ Valid JSON",
        description: "JSON is properly formatted and ready to use",
        variant: "success",
      });
    });

    expect(screen.getByText("VALID")).toBeInTheDocument();
  });

  it("should detect invalid JSON", async () => {
    const user = userEvent.setup();
    renderWithToast(<JsonDebugger />);

    const textarea = screen.getByPlaceholderText("Paste your JSON here...");
    const validateButton = screen.getByText("Validate JSON");

    await user.type(textarea, '{"name": "test", "value": 123,}');
    await user.click(validateButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("❌ Invalid JSON"),
          variant: "destructive",
        }),
      );
    });

    expect(screen.getByText("INVALID")).toBeInTheDocument();
  });

  it("should handle empty input validation", async () => {
    const user = userEvent.setup();
    renderWithToast(<JsonDebugger />);

    const validateButton = screen.getByText("Validate JSON");
    await user.click(validateButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Empty Input",
        description: "Please enter JSON content to validate",
        variant: "warning",
      });
    });
  });

  it("should format JSON", async () => {
    const user = userEvent.setup();
    renderWithToast(<JsonDebugger />);

    const textarea = screen.getByPlaceholderText("Paste your JSON here...");
    const formatButton = screen.getByText("Format JSON");

    await user.type(textarea, '{"name":"test","value":123}');
    await user.click(formatButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "✨ JSON Formatted",
        description:
          "JSON has been properly formatted with 2-space indentation",
        variant: "success",
      });
    });

    expect(textarea).toHaveValue('{\n  "name": "test",\n  "value": 123\n}');
  });

  it("should copy JSON to clipboard", async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    renderWithToast(<JsonDebugger />);

    const textarea = screen.getByPlaceholderText("Paste your JSON here...");
    const copyButton = screen.getByText("Copy");

    await user.type(textarea, '{"test": "value"}');
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith('{"test": "value"}');
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Copied",
        description: "JSON copied to clipboard",
        variant: "success",
      });
    });
  });

  it("should download JSON file", async () => {
    const user = userEvent.setup();

    // Mock URL and document methods
    const mockCreateObjectURL = vi.fn().mockReturnValue("blob:test-url");
    const mockRevokeObjectURL = vi.fn();
    const mockClick = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockAnchor = {
      href: "",
      download: "",
      click: mockClick,
    };

    vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as any);
    vi.spyOn(document.body, "appendChild").mockImplementation(mockAppendChild);
    vi.spyOn(document.body, "removeChild").mockImplementation(mockRemoveChild);

    renderWithToast(<JsonDebugger />);

    const textarea = screen.getByPlaceholderText("Paste your JSON here...");
    const downloadButton = screen.getByText("Download");

    await user.type(textarea, '{"test": "value"}');
    await user.click(downloadButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test-url");
  });

  it("should call onValidJson callback when JSON is valid", async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    renderWithToast(<JsonDebugger onValidJson={mockCallback} />);

    const textarea = screen.getByPlaceholderText("Paste your JSON here...");
    const validateButton = screen.getByText("Validate JSON");

    const validJson = '{"name": "test", "value": 123}';
    await user.type(textarea, validJson);
    await user.click(validateButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(validJson);
    });
  });

  it("should show auto-fix option for fixable JSON", async () => {
    const user = userEvent.setup();
    renderWithToast(<JsonDebugger />);

    const textarea = screen.getByPlaceholderText("Paste your JSON here...");
    const validateButton = screen.getByText("Validate JSON");

    await user.type(textarea, '{"name": "test", "value": 123,}');
    await user.click(validateButton);

    await waitFor(() => {
      expect(screen.getByText("Auto-fix Available")).toBeInTheDocument();
      expect(screen.getByText("Apply Auto-fix")).toBeInTheDocument();
    });
  });

  it("should apply auto-fix when clicked", async () => {
    const user = userEvent.setup();
    renderWithToast(<JsonDebugger />);

    const textarea = screen.getByPlaceholderText("Paste your JSON here...");
    const validateButton = screen.getByText("Validate JSON");

    await user.type(textarea, '{"name": "test", "value": 123,}');
    await user.click(validateButton);

    await waitFor(() => {
      expect(screen.getByText("Apply Auto-fix")).toBeInTheDocument();
    });

    const autoFixButton = screen.getByText("Apply Auto-fix");
    await user.click(autoFixButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Auto-fix Applied",
        description: "Common JSON issues have been corrected",
        variant: "success",
      });
    });
  });

  it("should display formatting rules", () => {
    renderWithToast(<JsonDebugger />);

    expect(screen.getByText("JSON Formatting Rules")).toBeInTheDocument();
    expect(
      screen.getByText("Use double quotes for strings and keys"),
    ).toBeInTheDocument();
  });

  it("should display common JSON errors", () => {
    renderWithToast(<JsonDebugger />);

    expect(screen.getByText("Common JSON Errors & Fixes")).toBeInTheDocument();
    expect(screen.getByText("Trailing Commas")).toBeInTheDocument();
    expect(screen.getByText("Single Quotes")).toBeInTheDocument();
    expect(screen.getByText("Unquoted Keys")).toBeInTheDocument();
  });
});
