import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  LoadingSpinner,
  Skeleton,
  ProgressBar,
  LoadingCard,
  EmptyState,
  ErrorState,
  SuccessState,
  AsyncState,
  withLoadingState,
  useAsyncState,
} from "@/components/ui/loading-states";
import { renderHook, act } from "@testing-library/react";

describe("LoadingSpinner", () => {
  it("renders with default props", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it("renders with custom size", () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner).toHaveClass("h-8", "w-8");
  });

  it("renders with text", () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-class" />);
    const container = screen.getByRole("status", {
      hidden: true,
    }).parentElement;
    expect(container).toHaveClass("custom-class");
  });
});

describe("Skeleton", () => {
  it("renders with default props", () => {
    render(<Skeleton />);
    const skeleton = document.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders multiple lines", () => {
    render(<Skeleton lines={3} />);
    const lines = document.querySelectorAll(".h-4.bg-gray-300.rounded");
    expect(lines).toHaveLength(3);
  });

  it("renders with avatar", () => {
    render(<Skeleton avatar />);
    const avatar = document.querySelector(
      ".rounded-full.bg-gray-300.h-10.w-10",
    );
    expect(avatar).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Skeleton className="custom-skeleton" />);
    const skeleton = document.querySelector(".custom-skeleton");
    expect(skeleton).toBeInTheDocument();
  });
});

describe("ProgressBar", () => {
  it("renders with progress value", () => {
    render(<ProgressBar progress={50} />);
    const progressBar = document.querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it("shows percentage by default", () => {
    render(<ProgressBar progress={75} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("hides percentage when showPercentage is false", () => {
    render(<ProgressBar progress={75} showPercentage={false} />);
    expect(screen.queryByText("75%")).not.toBeInTheDocument();
  });

  it("clamps progress to 0-100 range", () => {
    render(<ProgressBar progress={150} />);
    expect(screen.getByText("100%")).toBeInTheDocument();

    render(<ProgressBar progress={-10} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("applies different colors", () => {
    render(<ProgressBar progress={50} color="green" />);
    const progressBar = document.querySelector(".bg-green-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("applies different sizes", () => {
    render(<ProgressBar progress={50} size="lg" />);
    const container = document.querySelector(".h-4");
    expect(container).toBeInTheDocument();
  });
});

describe("LoadingCard", () => {
  it("renders with default props", () => {
    render(<LoadingCard />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders with custom title and description", () => {
    render(
      <LoadingCard
        title="Custom Loading"
        description="Please wait while we process your request"
      />,
    );
    expect(screen.getByText("Custom Loading")).toBeInTheDocument();
    expect(
      screen.getByText("Please wait while we process your request"),
    ).toBeInTheDocument();
  });

  it("renders with progress bar", () => {
    render(<LoadingCard progress={60} />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<LoadingCard className="custom-loading-card" />);
    const card = document.querySelector(".custom-loading-card");
    expect(card).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders with title", () => {
    render(<EmptyState title="No data found" />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("renders with description", () => {
    render(
      <EmptyState
        title="No data found"
        description="There are no items to display"
      />,
    );
    expect(
      screen.getByText("There are no items to display"),
    ).toBeInTheDocument();
  });

  it("renders with action button", () => {
    const mockAction = vi.fn();
    render(
      <EmptyState
        title="No data found"
        action={{ label: "Add Item", onClick: mockAction }}
      />,
    );

    const button = screen.getByText("Add Item");
    expect(button).toBeInTheDocument();

    button.click();
    expect(mockAction).toHaveBeenCalledOnce();
  });

  it("renders with custom icon", () => {
    const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;
    render(<EmptyState title="No data found" icon={<CustomIcon />} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders with default props", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "An error occurred while loading the data. Please try again.",
      ),
    ).toBeInTheDocument();
  });

  it("renders with custom title and description", () => {
    render(
      <ErrorState title="Custom Error" description="A custom error occurred" />,
    );
    expect(screen.getByText("Custom Error")).toBeInTheDocument();
    expect(screen.getByText("A custom error occurred")).toBeInTheDocument();
  });

  it("renders retry button when retry function provided", () => {
    const mockRetry = vi.fn();
    render(<ErrorState retry={mockRetry} />);

    const retryButton = screen.getByText("Try Again");
    expect(retryButton).toBeInTheDocument();

    retryButton.click();
    expect(mockRetry).toHaveBeenCalledOnce();
  });

  it("does not render retry button when no retry function", () => {
    render(<ErrorState />);
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });
});

describe("SuccessState", () => {
  it("renders with default props", () => {
    render(<SuccessState />);
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(
      screen.getByText("The operation completed successfully."),
    ).toBeInTheDocument();
  });

  it("renders with custom title and description", () => {
    render(
      <SuccessState
        title="Custom Success"
        description="Operation completed successfully"
      />,
    );
    expect(screen.getByText("Custom Success")).toBeInTheDocument();
    expect(
      screen.getByText("Operation completed successfully"),
    ).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const mockAction = vi.fn();
    render(
      <SuccessState action={{ label: "Continue", onClick: mockAction }} />,
    );

    const button = screen.getByText("Continue");
    expect(button).toBeInTheDocument();

    button.click();
    expect(mockAction).toHaveBeenCalledOnce();
  });
});

describe("AsyncState", () => {
  it("renders loading state", () => {
    render(
      <AsyncState loading={true} error={null} data={null}>
        {() => <div>Data content</div>}
      </AsyncState>,
    );
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const error = new Error("Test error");
    render(
      <AsyncState loading={false} error={error} data={null}>
        {() => <div>Data content</div>}
      </AsyncState>,
    );
    expect(screen.getByText("Failed to load data")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(
      <AsyncState loading={false} error={null} data={null}>
        {() => <div>Data content</div>}
      </AsyncState>,
    );
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders data when available", () => {
    const data = { message: "Hello World" };
    render(
      <AsyncState loading={false} error={null} data={data}>
        {(data) => <div>{data.message}</div>}
      </AsyncState>,
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("uses custom isEmpty function", () => {
    const data = [];
    render(
      <AsyncState
        loading={false}
        error={null}
        data={data}
        isEmpty={(data) => Array.isArray(data) && data.length === 0}
      >
        {() => <div>Data content</div>}
      </AsyncState>,
    );
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders custom components", () => {
    render(
      <AsyncState
        loading={true}
        error={null}
        data={null}
        loadingComponent={<div>Custom loading</div>}
        errorComponent={<div>Custom error</div>}
        emptyComponent={<div>Custom empty</div>}
      >
        {() => <div>Data content</div>}
      </AsyncState>,
    );
    expect(screen.getByText("Custom loading")).toBeInTheDocument();
  });
});

describe("withLoadingState HOC", () => {
  it("renders loading state when loading prop is true", () => {
    const TestComponent = () => <div>Test Content</div>;
    const WrappedComponent = withLoadingState(TestComponent);

    render(<WrappedComponent loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
  });

  it("renders component when loading prop is false", () => {
    const TestComponent = () => <div>Test Content</div>;
    const WrappedComponent = withLoadingState(TestComponent);

    render(<WrappedComponent loading={false} />);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("passes through other props", () => {
    const TestComponent = ({ message }: { message: string }) => (
      <div>{message}</div>
    );
    const WrappedComponent = withLoadingState(TestComponent);

    render(<WrappedComponent loading={false} message="Hello World" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("uses custom loading props", () => {
    const TestComponent = () => <div>Test Content</div>;
    const WrappedComponent = withLoadingState(TestComponent, {
      title: "Custom Loading",
      description: "Please wait",
    });

    render(<WrappedComponent loading={true} />);
    expect(screen.getByText("Custom Loading")).toBeInTheDocument();
    expect(screen.getByText("Please wait")).toBeInTheDocument();
  });
});

describe("useAsyncState hook", () => {
  it("initializes with default state", () => {
    const { result } = renderHook(() => useAsyncState());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it("handles successful async operation", async () => {
    const { result } = renderHook(() => useAsyncState());

    const mockAsyncFn = vi.fn().mockResolvedValue("success data");

    await act(async () => {
      const data = await result.current.execute(mockAsyncFn);
      expect(data).toBe("success data");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe("success data");
    expect(mockAsyncFn).toHaveBeenCalledOnce();
  });

  it("handles failed async operation", async () => {
    const { result } = renderHook(() => useAsyncState());

    const error = new Error("Async error");
    const mockAsyncFn = vi.fn().mockRejectedValue(error);

    await act(async () => {
      try {
        await result.current.execute(mockAsyncFn);
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(result.current.data).toBe(null);
  });

  it("sets loading state during execution", async () => {
    const { result } = renderHook(() => useAsyncState());

    const mockAsyncFn = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve("data"), 100)),
      );

    act(() => {
      result.current.execute(mockAsyncFn);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe("data");
  });

  it("resets state", () => {
    const { result } = renderHook(() => useAsyncState());

    // Set some state first
    act(() => {
      result.current.execute(() => Promise.resolve("test data"));
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it("handles non-Error objects in catch", async () => {
    const { result } = renderHook(() => useAsyncState());

    const mockAsyncFn = vi.fn().mockRejectedValue("string error");

    await act(async () => {
      try {
        await result.current.execute(mockAsyncFn);
      } catch (e) {
        expect(e).toBe("string error");
      }
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("string error");
  });
});
