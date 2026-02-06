import { test, expect } from "@playwright/test";

test.describe("Speed Test Application", () => {
  test.describe("Home Page - Start Test Flow", () => {
    test("should display the speed test interface", async ({ page }) => {
      await page.goto("/");

      // Verify main heading
      await expect(
        page.getByRole("heading", { name: /Speed Test/i }),
      ).toBeVisible();

      // Verify START TEST button is visible
      await expect(
        page.getByRole("button", { name: /START TEST/i }),
      ).toBeVisible();

      // Verify initial metrics are displayed
      await expect(page.getByText(/Download Mbps/i)).toBeVisible();
      await expect(page.getByText(/Upload Mbps/i)).toBeVisible();
      await expect(page.getByText(/Ping/i)).toBeVisible();
    });

    test("should show testing state when START TEST is clicked", async ({
      page,
    }) => {
      await page.goto("/");

      // Click START TEST button
      await page.getByRole("button", { name: /START TEST/i }).click();

      // Wait a moment for state to update
      await page.waitForTimeout(500);

      // Verify button changes to TESTING...
      await expect(
        page.getByRole("button", { name: /TESTING/i }),
      ).toBeVisible();

      // Verify button is disabled during test
      await expect(
        page.getByRole("button", { name: /TESTING/i }),
      ).toBeDisabled();

      // Verify current status is displayed
      await expect(page.getByText(/Current Status:/i)).toBeVisible();
    });

    test("should update metrics during test", async ({ page }) => {
      await page.goto("/");

      // Get initial download value (should be ---)
      const initialDownload = await page
        .locator("text=/Download Mbps/i")
        .locator("..")
        .locator("div")
        .first()
        .textContent();
      expect(initialDownload).toContain("---");

      // Start test
      await page.getByRole("button", { name: /START TEST/i }).click();

      // Wait for some metrics to update (ping usually happens first)
      await page.waitForTimeout(2000);

      // Check if any metric has updated from ---
      const downloadValue = await page
        .locator("text=/Download Mbps/i")
        .locator("..")
        .locator("div")
        .first()
        .textContent();
      const uploadValue = await page
        .locator("text=/Upload Mbps/i")
        .locator("..")
        .locator("div")
        .first()
        .textContent();
      const pingValue = await page
        .locator("text=/Ping/i")
        .locator("..")
        .locator("div")
        .first()
        .textContent();

      // At least one metric should have updated
      const hasUpdated =
        !downloadValue?.includes("---") ||
        !uploadValue?.includes("---") ||
        !pingValue?.includes("---");

      expect(hasUpdated).toBe(true);
    });

    test("should redirect to result page after test completes", async ({
      page,
    }) => {
      await page.goto("/");

      // Start test
      await page.getByRole("button", { name: /START TEST/i }).click();

      // Wait for test to complete and redirect (with generous timeout)
      await page.waitForURL(/\/result\?/, { timeout: 30000 });

      // Verify we're on the result page
      expect(page.url()).toContain("/result");

      // Verify result page has query parameters
      const url = new URL(page.url());
      expect(url.searchParams.has("download")).toBe(true);
      expect(url.searchParams.has("upload")).toBe(true);
      expect(url.searchParams.has("ping")).toBe(true);
      expect(url.searchParams.has("jitter")).toBe(true);
    });
  });

  test.describe("Result Page", () => {
    test("should display test results", async ({ page }) => {
      // Navigate directly to result page with mock data
      await page.goto(
        "/result?download=100.50&upload=50.25&ping=20.00&jitter=5.00",
      );

      // Verify health score is displayed
      await expect(
        page.getByRole("heading", { name: /Your Internet Health Score/i }),
      ).toBeVisible();

      // Verify metrics are displayed
      await expect(page.getByText(/100/)).toBeVisible(); // Download speed
      await expect(page.getByText(/50/)).toBeVisible(); // Upload speed
      await expect(page.getByText(/20/)).toBeVisible(); // Ping
      await expect(page.getByText(/5/)).toBeVisible(); // Jitter
    });

    test("should calculate and display health score", async ({ page }) => {
      await page.goto(
        "/result?download=100.00&upload=50.00&ping=15.00&jitter=3.00",
      );

      // Wait for health score to be calculated and displayed
      await page.waitForTimeout(1000);

      // Health score should be visible as a number
      const scoreElement = page
        .locator("text=/Health Score|Score/i")
        .locator("..")
        .getByText(/\d+/);
      await expect(scoreElement).toBeVisible();

      // Score should be between 0 and 100
      const scoreText = await scoreElement.textContent();
      const score = parseInt(scoreText || "0");
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test("should allow navigation back to home", async ({ page }) => {
      await page.goto("/result?download=100&upload=50&ping=20&jitter=5");

      // Find and click navigation link to home
      await page
        .getByRole("link", { name: /test again|new test|home/i })
        .click();

      // Should be back on home page
      await expect(
        page.getByRole("heading", { name: /Speed Test/i }),
      ).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to history page", async ({ page }) => {
      await page.goto("/");

      // Click on history link in navigation
      await page.getByRole("link", { name: /history/i }).click();

      // Should be on history page
      await page.waitForURL("/history");
      await expect(
        page.getByRole("heading", { name: /test history/i }),
      ).toBeVisible();
    });

    test("should navigate to profile page", async ({ page }) => {
      await page.goto("/");

      // Click on profile link in navigation
      await page.getByRole("link", { name: /profile/i }).click();

      // Should be on profile page
      await page.waitForURL("/profile");
      await expect(
        page.getByRole("heading", { name: /profile/i }),
      ).toBeVisible();
    });

    test("should navigate between pages using navbar", async ({ page }) => {
      await page.goto("/");

      // Navigate to History
      await page.getByRole("link", { name: /history/i }).click();
      await expect(page).toHaveURL("/history");

      // Navigate to Profile
      await page.getByRole("link", { name: /profile/i }).click();
      await expect(page).toHaveURL("/profile");

      // Navigate back to Home
      await page
        .getByRole("link", { name: /home|speed test/i })
        .first()
        .click();
      await expect(page).toHaveURL("/");
    });
  });

  test.describe("Responsive Design", () => {
    test("should display correctly on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      await page.goto("/");

      // Verify main elements are still visible
      await expect(
        page.getByRole("heading", { name: /Speed Test/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /START TEST/i }),
      ).toBeVisible();
    });

    test("should display correctly on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
      await page.goto("/");

      // Verify main elements are still visible
      await expect(
        page.getByRole("heading", { name: /Speed Test/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /START TEST/i }),
      ).toBeVisible();
    });
  });
});
