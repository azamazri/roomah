import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByText("Click me");
    expect(button).toBeDisabled();
  });

  it("applies variant classes", () => {
    const { rerender } = render(<Button variant="outline">Click me</Button>);
    let button = screen.getByText("Click me");
    expect(button.className).toContain("outline");

    rerender(<Button variant="destructive">Click me</Button>);
    button = screen.getByText("Click me");
    expect(button.className).toContain("destructive");
  });
});
