# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-flow.spec.ts >> ALTYN SEO Panel - Full E2E Flow >> should have login page accessible
- Location: e2e/full-flow.spec.ts:33:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:react-babel] /home/ubuntu/altyn-therapy-admin/client/src/pages/Settings.tsx: Identifier 'trpc' has already been declared. (29:9) 32 | Allow: /"
  - generic [ref=e5]: /home/ubuntu/altyn-therapy-admin/client/src/pages/Settings.tsx:29:9
  - generic [ref=e6]: "27 | } from \"lucide-react\"; 28 | import { Separator } from \"@/components/ui/separator\"; 29 | import { trpc } from \"@/lib/trpc\"; | ^ 30 | 31 | const DEFAULT_ROBOTS = `User-agent: *"
  - generic [ref=e7]: at toParseError (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parse-error.ts:95:45) at raise (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/tokenizer/index.ts:1504:19) at declareName (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/plugins/typescript/scope.ts:72:21) at declareNameFromIdentifier (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/lval.ts:876:16) at checkIdentifier (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/lval.ts:871:12) at checkLVal (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/lval.ts:763:12) at finishImportSpecifier (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:3229:10) at parseImportSpecifier (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:3490:17) at parseImportSpecifier (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/plugins/typescript/index.ts:4404:20) at parseNamedImportSpecifiers (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:3451:36) at parseImportSpecifiersAndAfter (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:3179:37) at parseImport (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:3148:17) at parseImport (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/plugins/typescript/index.ts:2970:28) at parseStatementContent (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:647:25) at parseStatementContent (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/plugins/typescript/index.ts:3220:20) at parseStatementLike (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:482:17) at parseModuleItem (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:419:17) at parseBlockOrModuleBlockBody (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:1443:16) at parseBlockBody (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:1417:10) at parseProgram (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:229:10) at parseTopLevel (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/statement.ts:203:25) at parse (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/parser/index.ts:83:25) at parse (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/plugins/typescript/index.ts:4354:20) at parse (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+parser@7.29.2/node_modules/@babel/parser/src/index.ts:86:38) at parser (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+core@7.29.0/node_modules/@babel/core/src/parser/index.ts:29:19) at parser.next (<anonymous>) at normalizeFile (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+core@7.29.0/node_modules/@babel/core/src/transformation/normalize-file.ts:50:24) at normalizeFile.next (<anonymous>) at run (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+core@7.29.0/node_modules/@babel/core/src/transformation/index.ts:41:36) at run.next (<anonymous>) at transform (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+core@7.29.0/node_modules/@babel/core/src/transform.ts:29:20) at transform.next (<anonymous>) at step (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/gensync@1.0.0-beta.2/node_modules/gensync/index.js:261:32) at /home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/gensync@1.0.0-beta.2/node_modules/gensync/index.js:273:13 at async.call.result.err.err (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/gensync@1.0.0-beta.2/node_modules/gensync/index.js:223:11) at /home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/gensync@1.0.0-beta.2/node_modules/gensync/index.js:189:28 at <anonymous> (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/@babel+core@7.29.0/node_modules/@babel/core/src/gensync-utils/async.ts:90:7) at /home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/gensync@1.0.0-beta.2/node_modules/gensync/index.js:113:33 at step (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/gensync@1.0.0-beta.2/node_modules/gensync/index.js:287:14) at /home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/gensync@1.0.0-beta.2/node_modules/gensync/index.js:273:13 at async.call.result.err.err (/home/ubuntu/altyn-therapy-admin/node_modules/.pnpm/gensync@1.0.0-beta.2/node_modules/gensync/index.js:223:11)
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.js
    - text: .
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  4   | 
  5   | test.describe('ALTYN SEO Panel - Full E2E Flow', () => {
  6   |   test.beforeEach(async ({ page }) => {
  7   |     // Clear cookies before each test
  8   |     await page.context().clearCookies();
  9   |     // Try to clear localStorage, but don't fail if it's not accessible
  10  |     try {
  11  |       await page.evaluate(() => {
  12  |         try {
  13  |           localStorage.clear();
  14  |         } catch (e) {
  15  |           // localStorage might not be accessible in some contexts
  16  |         }
  17  |       });
  18  |     } catch (e) {
  19  |       // Ignore localStorage errors
  20  |     }
  21  |   });
  22  | 
  23  |   test('should load the application', async ({ page }) => {
  24  |     // Navigate to app
  25  |     await page.goto(BASE_URL);
  26  |     await page.waitForLoadState('networkidle');
  27  |     
  28  |     // Should be on login, register, or dashboard
  29  |     const url = page.url();
  30  |     expect(url).toMatch(/login|register|\/$/);
  31  |   });
  32  | 
  33  |   test('should have login page accessible', async ({ page }) => {
  34  |     // Navigate to login
  35  |     await page.goto(BASE_URL + '/login');
  36  |     await page.waitForLoadState('networkidle');
  37  |     
  38  |     // Should be on login page
  39  |     await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  40  |     
  41  |     // Should have email and password inputs
  42  |     const emailInput = page.locator('input[placeholder*="email"], input[placeholder*="Email"]').first();
  43  |     const passwordInput = page.locator('input[placeholder*="password"], input[placeholder*="Password"]').first();
  44  |     
> 45  |     expect(await emailInput.isVisible() || await passwordInput.isVisible()).toBeTruthy();
      |                                                                             ^ Error: expect(received).toBeTruthy()
  46  |   });
  47  | 
  48  |   test('should have register page accessible', async ({ page }) => {
  49  |     // Navigate to register
  50  |     await page.goto(BASE_URL + '/register');
  51  |     await page.waitForLoadState('networkidle');
  52  |     
  53  |     // Should be on register page
  54  |     await expect(page).toHaveURL(/\/register/, { timeout: 5000 });
  55  |     
  56  |     // Should have form inputs
  57  |     const inputs = page.locator('input');
  58  |     expect(await inputs.count()).toBeGreaterThan(0);
  59  |   });
  60  | 
  61  |   test('should prevent unauthorized access to protected routes', async ({ page }) => {
  62  |     // Try to access protected route without authentication
  63  |     await page.goto(BASE_URL + '/articles');
  64  |     
  65  |     // Should redirect to login page (wait for redirect)
  66  |     await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  67  |   });
  68  | 
  69  |   test('should have proper navigation structure', async ({ page }) => {
  70  |     // Navigate to app
  71  |     await page.goto(BASE_URL);
  72  |     await page.waitForLoadState('networkidle');
  73  |     
  74  |     // Check if page loads without errors
  75  |     const errors = [];
  76  |     page.on('console', msg => {
  77  |       if (msg.type() === 'error') {
  78  |         errors.push(msg.text());
  79  |       }
  80  |     });
  81  |     
  82  |     // Wait a bit for any errors to appear
  83  |     await page.waitForTimeout(2000);
  84  |     
  85  |     // Should not have critical errors
  86  |     const criticalErrors = errors.filter(e => !e.includes('404') && !e.includes('network'));
  87  |     expect(criticalErrors.length).toBeLessThan(5);
  88  |   });
  89  | 
  90  |   test('should have responsive design', async ({ page }) => {
  91  |     // Test desktop view
  92  |     await page.setViewportSize({ width: 1920, height: 1080 });
  93  |     await page.goto(BASE_URL);
  94  |     await page.waitForLoadState('networkidle');
  95  |     
  96  |     // Should load without layout issues
  97  |     const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
  98  |     expect(bodyWidth).toBeGreaterThan(0);
  99  |     
  100 |     // Test mobile view
  101 |     await page.setViewportSize({ width: 375, height: 667 });
  102 |     await page.goto(BASE_URL);
  103 |     await page.waitForLoadState('networkidle');
  104 |     
  105 |     // Should load without layout issues
  106 |     const mobileWidth = await page.evaluate(() => document.body.offsetWidth);
  107 |     expect(mobileWidth).toBeGreaterThan(0);
  108 |   });
  109 | 
  110 |   test('should have proper error handling', async ({ page }) => {
  111 |     // Navigate to non-existent page
  112 |     await page.goto(BASE_URL + '/non-existent-page');
  113 |     await page.waitForLoadState('networkidle');
  114 |     
  115 |     // Should show 404 or redirect to login
  116 |     const url = page.url();
  117 |     expect(url).toMatch(/404|login|\/$/);
  118 |   });
  119 | 
  120 |   test('should load dashboard when authenticated', async ({ page }) => {
  121 |     // Navigate to app
  122 |     await page.goto(BASE_URL);
  123 |     await page.waitForLoadState('networkidle');
  124 |     
  125 |     // Check current URL
  126 |     const url = page.url();
  127 |     
  128 |     // If on login, that's fine (not authenticated)
  129 |     // If on dashboard, that's also fine (authenticated)
  130 |     expect(url).toMatch(/login|register|\/$/);
  131 |   });
  132 | 
  133 |   test('should have working UI elements', async ({ page }) => {
  134 |     // Navigate to login
  135 |     await page.goto(BASE_URL + '/login');
  136 |     await page.waitForLoadState('networkidle');
  137 |     
  138 |     // Should have clickable buttons
  139 |     const buttons = page.locator('button');
  140 |     const buttonCount = await buttons.count();
  141 |     expect(buttonCount).toBeGreaterThan(0);
  142 |     
  143 |     // Should have visible inputs
  144 |     const inputs = page.locator('input');
  145 |     const inputCount = await inputs.count();
```