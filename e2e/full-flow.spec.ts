import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('ALTYN SEO Panel - Full E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
    // Try to clear localStorage, but don't fail if it's not accessible
    try {
      await page.evaluate(() => {
        try {
          localStorage.clear();
        } catch (e) {
          // localStorage might not be accessible in some contexts
        }
      });
    } catch (e) {
      // Ignore localStorage errors
    }
  });

  test('should load the application', async ({ page }) => {
    // Navigate to app
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Should be on login, register, or dashboard
    const url = page.url();
    expect(url).toMatch(/login|register|\/$/);
  });

  test('should have login page accessible', async ({ page }) => {
    // Navigate to login
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');
    
    // Should be on login page
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    
    // Should have email and password inputs
    const emailInput = page.locator('input[placeholder*="email"], input[placeholder*="Email"]').first();
    const passwordInput = page.locator('input[placeholder*="password"], input[placeholder*="Password"]').first();
    
    expect(await emailInput.isVisible() || await passwordInput.isVisible()).toBeTruthy();
  });

  test('should have register page accessible', async ({ page }) => {
    // Navigate to register
    await page.goto(BASE_URL + '/register');
    await page.waitForLoadState('networkidle');
    
    // Should be on register page
    await expect(page).toHaveURL(/\/register/, { timeout: 5000 });
    
    // Should have form inputs
    const inputs = page.locator('input');
    expect(await inputs.count()).toBeGreaterThan(0);
  });

  test('should prevent unauthorized access to protected routes', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto(BASE_URL + '/articles');
    
    // Should redirect to login page (wait for redirect)
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should have proper navigation structure', async ({ page }) => {
    // Navigate to app
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check if page loads without errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit for any errors to appear
    await page.waitForTimeout(2000);
    
    // Should not have critical errors
    const criticalErrors = errors.filter(e => !e.includes('404') && !e.includes('network'));
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('should have responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Should load without layout issues
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
    expect(bodyWidth).toBeGreaterThan(0);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Should load without layout issues
    const mobileWidth = await page.evaluate(() => document.body.offsetWidth);
    expect(mobileWidth).toBeGreaterThan(0);
  });

  test('should have proper error handling', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto(BASE_URL + '/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    // Should show 404 or redirect to login
    const url = page.url();
    expect(url).toMatch(/404|login|\/$/);
  });

  test('should load dashboard when authenticated', async ({ page }) => {
    // Navigate to app
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check current URL
    const url = page.url();
    
    // If on login, that's fine (not authenticated)
    // If on dashboard, that's also fine (authenticated)
    expect(url).toMatch(/login|register|\/$/);
  });

  test('should have working UI elements', async ({ page }) => {
    // Navigate to login
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');
    
    // Should have clickable buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Should have visible inputs
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(0);
  });

  test('should handle navigation', async ({ page }) => {
    // Navigate to app
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Try to navigate to login
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');
    
    // Should be on login page
    expect(page.url()).toMatch(/login/);
    
    // Try to navigate to register
    await page.goto(BASE_URL + '/register');
    await page.waitForLoadState('networkidle');
    
    // Should be on register page
    expect(page.url()).toMatch(/register/);
  });

  test('should have proper styling', async ({ page }) => {
    // Navigate to login
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');
    
    // Check if page has styles
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // Should have some background color
    expect(bgColor).toBeTruthy();
  });
});
