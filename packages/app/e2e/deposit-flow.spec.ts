import { test, expect } from "@playwright/test";

test.describe("Deposit flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows the dashboard with connect button", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Veda RWA Platform" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Connect Freighter" }),
    ).toBeVisible();
  });

  test("displays asset cards when listed", async ({ page }) => {
    await page.route("**/assets", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "1",
            asset_id: "us-tbill-001",
            name: "US Treasury Bill Series Q1",
            asset_type: "treasury-bill",
            total_value: 50_000_000_00,
            token_contract: null,
            active: true,
          },
        ]),
      });
    });
    await page.reload();
    await expect(
      page.getByText("US Treasury Bill Series Q1"),
    ).toBeVisible();
  });

  test("shows KYC status banner for registered investor", async ({ page }) => {
    await page.route("**/kyc/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "abc-123",
          stellar_address: "GA7QNFHDH73F7X7YD5C5FZ7Q7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7",
          email: "alice@veda.finance",
          kyc_status: "approved",
          aml_status: "approved",
        }),
      });
    });
    await page.evaluate(() => {
      window.freighter = {
        isConnected: async () => ({ isConnected: true }),
        getPublicKey: async () => "GA7QNFHDH73F7X7YD5C5FZ7Q7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7",
      };
    });
    await page.reload();
    await expect(page.getByText(/KYC:/)).toBeVisible();
  });

  test("shows unregistered banner for unknown address", async ({ page }) => {
    await page.route("**/kyc/**", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Not found" }),
      });
    });
    await page.evaluate(() => {
      window.freighter = {
        isConnected: async () => ({ isConnected: true }),
        getPublicKey: async () => "GB4RNFHDH73F7X7YD5C5FZ7Q7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7",
      };
    });
    await page.reload();
    await expect(
      page.getByText("Address not registered"),
    ).toBeVisible();
  });
});
