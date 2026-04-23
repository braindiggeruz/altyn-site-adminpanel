import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('ALTYN SEO Panel - Full E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and cookies before each test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('should complete full user journey: register -> login -> create article -> logout', async ({ page }) => {
    // Step 1: Navigate to app
    await page.goto(BASE_URL);
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
    
    // Step 2: Register first user (becomes admin)
    await page.click('text=Don\'t have an account');
    await expect(page).toHaveURL(/\/register/);
    
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123';
    const name = 'Test Admin';
    
    await page.fill('input[placeholder*="name"]', name);
    await page.fill('input[placeholder*="email"]', email);
    await page.fill('input[placeholder*="password"]', password);
    await page.fill('input[placeholder*="confirm"]', password);
    
    await page.click('button:has-text("Register")');
    
    // Should redirect to dashboard after registration
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
    
    // Step 3: Verify dashboard loads
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Total Articles')).toBeVisible();
    await expect(page.locator('text=Published Articles')).toBeVisible();
    
    // Step 4: Navigate to Articles
    await page.click('text=Articles');
    await expect(page).toHaveURL(/\/articles/);
    
    // Step 5: Create new article
    await page.click('button:has-text("New Article")');
    await expect(page).toHaveURL(/\/articles\/new/);
    
    const articleTitle = `Test Article ${Date.now()}`;
    const articleContent = 'This is a test article content for SEO testing.';
    const h1 = 'Test Article H1';
    const metaDescription = 'This is a test meta description for SEO';
    const targetKeyword = 'test keyword';
    
    // Fill article form
    await page.fill('input[placeholder*="Title"]', articleTitle);
    await page.fill('input[placeholder*="H1"]', h1);
    await page.fill('textarea[placeholder*="Meta"]', metaDescription);
    await page.fill('input[placeholder*="Target"]', targetKeyword);
    
    // Fill content using rich editor
    const editorFrame = page.locator('[contenteditable="true"]').first();
    await editorFrame.click();
    await editorFrame.type(articleContent);
    
    // Select status
    await page.click('select');
    await page.click('option[value="published"]');
    
    // Save article
    await page.click('button:has-text("Save")');
    
    // Should redirect to articles list
    await expect(page).toHaveURL(/\/articles/);
    await expect(page.locator(`text=${articleTitle}`)).toBeVisible({ timeout: 5000 });
    
    // Step 6: Verify article appears in dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
    await expect(page.locator(`text=${articleTitle}`)).toBeVisible();
    
    // Step 7: Test Keywords section
    await page.click('text=Keywords');
    await expect(page).toHaveURL(/\/keywords/);
    
    await page.click('button:has-text("New Keyword")');
    const keyword = `test-keyword-${Date.now()}`;
    await page.fill('input[placeholder*="Keyword"]', keyword);
    await page.fill('input[placeholder*="Search Volume"]', '1000');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator(`text=${keyword}`)).toBeVisible({ timeout: 5000 });
    
    // Step 8: Test Settings
    await page.click('text=Settings');
    await expect(page).toHaveURL(/\/settings/);
    
    const siteName = 'ALTYN Therapy SEO';
    await page.fill('input[placeholder*="Site Name"]', siteName);
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=Settings saved')).toBeVisible({ timeout: 5000 });
    
    // Step 9: Logout
    await page.click('button[title*="User"]');
    await page.click('text=Logout');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
    
    // Step 10: Login again with same credentials
    await page.fill('input[placeholder*="email"]', email);
    await page.fill('input[placeholder*="password"]', password);
    await page.click('button:has-text("Login")');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
    
    // Verify previous data is still there
    await page.click('text=Articles');
    await expect(page.locator(`text=${articleTitle}`)).toBeVisible();
  });

  test('should handle authentication errors correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Try login with invalid credentials
    await page.fill('input[placeholder*="email"]', 'invalid@example.com');
    await page.fill('input[placeholder*="password"]', 'wrongpassword');
    await page.click('button:has-text("Login")');
    
    // Should show error message
    await expect(page.locator('text=Login failed')).toBeVisible({ timeout: 5000 });
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should prevent unauthorized access to protected routes', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto(`${BASE_URL}/articles`);
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should validate form inputs correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Try to register with invalid email
    await page.fill('input[placeholder*="name"]', 'Test User');
    await page.fill('input[placeholder*="email"]', 'invalid-email');
    await page.fill('input[placeholder*="password"]', 'pass');
    await page.fill('input[placeholder*="confirm"]', 'pass');
    
    // Should show validation errors
    await expect(page.locator('text=Invalid email')).toBeVisible();
    await expect(page.locator('text=at least 6 characters')).toBeVisible();
    
    // Submit button should be disabled
    const submitButton = page.locator('button:has-text("Register")');
    await expect(submitButton).toBeDisabled();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123';
    
    // Register user
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[placeholder*="name"]', 'Test User');
    await page.fill('input[placeholder*="email"]', email);
    await page.fill('input[placeholder*="password"]', password);
    await page.fill('input[placeholder*="confirm"]', password);
    await page.click('button:has-text("Register")');
    
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
    
    // Try to create article with missing required fields
    await page.click('text=Articles');
    await page.click('button:has-text("New Article")');
    
    // Try to save without filling required fields
    await page.click('button:has-text("Save")');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should support language switching', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123';
    
    // Register and login
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[placeholder*="name"]', 'Test User');
    await page.fill('input[placeholder*="email"]', email);
    await page.fill('input[placeholder*="password"]', password);
    await page.fill('input[placeholder*="confirm"]', password);
    await page.click('button:has-text("Register")');
    
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
    
    // Switch to English
    await page.click('button[title*="Language"]');
    await page.click('text=English');
    
    // Verify UI is in English
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Switch back to Russian
    await page.click('button[title*="Language"]');
    await page.click('text=Русский');
    
    // Verify UI is in Russian
    await expect(page.locator('text=Главная панель')).toBeVisible();
  });

  test('should handle concurrent requests correctly', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123';
    
    // Register
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[placeholder*="name"]', 'Test User');
    await page.fill('input[placeholder*="email"]', email);
    await page.fill('input[placeholder*="password"]', password);
    await page.fill('input[placeholder*="confirm"]', password);
    await page.click('button:has-text("Register")');
    
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
    
    // Create multiple articles quickly
    for (let i = 0; i < 3; i++) {
      await page.click('text=Articles');
      await page.click('button:has-text("New Article")');
      
      await page.fill('input[placeholder*="Title"]', `Article ${i}`);
      await page.fill('input[placeholder*="H1"]', `H1 ${i}`);
      await page.fill('textarea[placeholder*="Meta"]', `Meta ${i}`);
      
      await page.click('button:has-text("Save")');
      await expect(page).toHaveURL(/\/articles/);
    }
    
    // Verify all articles are created
    await page.click('text=Articles');
    for (let i = 0; i < 3; i++) {
      await expect(page.locator(`text=Article ${i}`)).toBeVisible();
    }
  });
});
