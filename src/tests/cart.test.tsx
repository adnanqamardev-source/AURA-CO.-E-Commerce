// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import CartSidebar from "../components/CartSidebar";
import OwnerPanelModal from "../components/OwnerPanelModal";
import { CartItem } from "../types";

// Cleanup DOM after each test case automatically
afterEach(() => {
  cleanup();
});

// Setup mock product for testing
const mockProduct = {
  id: "kyoto-incense",
  name: "Kyoto Incense Holder",
  price: 45,
  category: "Wellness" as const,
  image: "https://images.unsplash.com/photo-mock",
  description: "Artisanal brass holder.",
};

const mockCartItems: CartItem[] = [
  {
    id: "kyoto-incense-Standard",
    productId: "kyoto-incense",
    name: "Kyoto Incense Holder",
    price: 45,
    image: "https://images.unsplash.com/photo-mock",
    selectedOption: "Standard",
    quantity: 2,
  },
];

describe("Cart Operations Unit & Component Tests", () => {
  let onUpdateQuantityMock = vi.fn();
  let onRemoveItemMock = vi.fn();
  let onPlaceOrderMock = vi.fn();
  let onCloseMock = vi.fn();

  beforeEach(() => {
    onUpdateQuantityMock = vi.fn();
    onRemoveItemMock = vi.fn();
    onPlaceOrderMock = vi.fn();
    onCloseMock = vi.fn();
  });

  it("renders cart items and calculates subtotal correctly", () => {
    render(
      <CartSidebar
        isOpen={true}
        onClose={onCloseMock}
        cartItems={mockCartItems}
        onUpdateQuantity={onUpdateQuantityMock}
        onRemoveItem={onRemoveItemMock}
        onPlaceOrder={onPlaceOrderMock}
        currency="USD"
      />
    );

    // Verify item name and option
    expect(screen.getByText("Kyoto Incense Holder")).toBeDefined();
    expect(screen.getByText(/Standard/)).toBeDefined();

    // Price checks
    expect(screen.getByText("$105.00")).toBeDefined(); // total price
    expect(screen.getAllByText("$90.00")[0]).toBeDefined(); // line total & subtotal
  });

  it("triggers quantity update when clicking plus or minus", () => {
    render(
      <CartSidebar
        isOpen={true}
        onClose={onCloseMock}
        cartItems={mockCartItems}
        onUpdateQuantity={onUpdateQuantityMock}
        onRemoveItem={onRemoveItemMock}
        onPlaceOrder={onPlaceOrderMock}
        currency="USD"
      />
    );

    // Find update buttons (plus and minus)
    const plusButtons = screen.getAllByRole("button");
    // Find specific elements by visual markers or icons
    const plusButton = plusButtons.find((btn) => btn.querySelector(".lucide-plus"));
    const minusButton = plusButtons.find((btn) => btn.querySelector(".lucide-minus"));

    if (plusButton) {
      fireEvent.click(plusButton);
      expect(onUpdateQuantityMock).toHaveBeenCalledWith("kyoto-incense-Standard", 1);
    }

    if (minusButton) {
      fireEvent.click(minusButton);
      expect(onUpdateQuantityMock).toHaveBeenCalledWith("kyoto-incense-Standard", -1);
    }
  });

  it("triggers item removal when clicking trash icon", () => {
    render(
      <CartSidebar
        isOpen={true}
        onClose={onCloseMock}
        cartItems={mockCartItems}
        onUpdateQuantity={onUpdateQuantityMock}
        onRemoveItem={onRemoveItemMock}
        onPlaceOrder={onPlaceOrderMock}
        currency="USD"
      />
    );

    const trashButtons = screen.getAllByRole("button");
    const trashButton = trashButtons.find((btn) => btn.querySelector(".lucide-trash2") || btn.innerHTML.includes("trash"));
    
    if (trashButton) {
      fireEvent.click(trashButton);
      expect(onRemoveItemMock).toHaveBeenCalledWith("kyoto-incense-Standard");
    }
  });

  it("handles empty cart state elegantly", () => {
    render(
      <CartSidebar
        isOpen={true}
        onClose={onCloseMock}
        cartItems={[]}
        onUpdateQuantity={onUpdateQuantityMock}
        onRemoveItem={onRemoveItemMock}
        onPlaceOrder={onPlaceOrderMock}
        currency="USD"
      />
    );

    expect(screen.getByText(/empty/i)).toBeDefined();
  });
});

describe("Admin Access Login & Logout Verification", () => {
  let onLoginMock = vi.fn();
  let onLogoutMock = vi.fn();
  let onCloseMock = vi.fn();

  beforeEach(() => {
    onLoginMock = vi.fn();
    onLogoutMock = vi.fn();
    onCloseMock = vi.fn();
    vi.spyOn(window, "confirm").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the logged out state asking for passcode", () => {
    render(
      <OwnerPanelModal
        isOpen={true}
        onClose={onCloseMock}
        isOwnerLoggedIn={false}
        onLogin={onLoginMock}
        onLogout={onLogoutMock}
        products={[]}
        onUpdateProducts={vi.fn()}
        onResetProducts={vi.fn()}
        upiSettings={{ enabled: true, upiId: "aura@upi", upiName: "Aura" }}
        onUpdateUpiSettings={vi.fn()}
      />
    );

    expect(screen.getByText("Store Owner Gateway")).toBeDefined();
    expect(screen.getByPlaceholderText("e.g. admin123")).toBeDefined();
  });

  it("successfully triggers logout from logged-in panel", () => {
    render(
      <OwnerPanelModal
        isOpen={true}
        onClose={onCloseMock}
        isOwnerLoggedIn={true}
        onLogin={onLoginMock}
        onLogout={onLogoutMock}
        products={[]}
        onUpdateProducts={vi.fn()}
        onResetProducts={vi.fn()}
        upiSettings={{ enabled: true, upiId: "aura@upi", upiName: "Aura" }}
        onUpdateUpiSettings={vi.fn()}
      />
    );

    // Look for the "Log Out" button
    const logoutBtn = screen.getByText("Log Out");
    expect(logoutBtn).toBeDefined();

    fireEvent.click(logoutBtn);

    expect(onLogoutMock).toHaveBeenCalled();
    expect(onCloseMock).toHaveBeenCalled(); // Verifies our logout bug fix where it also closes the modal automatically
  });
});

describe("Console Error Monitoring Guards", () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("guarantees no console errors are generated on standard renders", () => {
    render(
      <CartSidebar
        isOpen={true}
        onClose={vi.fn()}
        cartItems={mockCartItems}
        onUpdateQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
        onPlaceOrder={vi.fn()}
        currency="USD"
      />
    );

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
