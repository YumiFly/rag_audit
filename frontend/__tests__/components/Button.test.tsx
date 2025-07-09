"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "@/components/ui/button"
import jest from "jest" // Import jest to fix the undeclared variable error

describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("handles click events", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("applies correct variant classes", () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("bg-destructive")
  })

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
  })
})
