const { chromium } = require('playwright');

async function testAuthentication() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Taking screenshot of homepage...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({ path: 'screenshots/auth-test-01-homepage.png', fullPage: true });
    
    console.log('2. Looking for sign-in elements...');
    
    // Look for common login elements
    const usernameField = page.locator('input[name="username"], input[type="text"]:first-child, input[placeholder*="username" i], input[placeholder*="email" i]');
    const passwordField = page.locator('input[name="password"], input[type="password"]');
    const loginButton = page.locator('button:has-text("Sign In"), button:has-text("Login"), button[type="submit"]');
    
    // Check if we need to navigate to sign-in page
    const isOnLoginPage = await usernameField.isVisible();
    
    if (!isOnLoginPage) {
      console.log('3. Not on login page, looking for sign-in link...');
      const signInLink = page.locator('a:has-text("Sign In"), a:has-text("Login"), a[href*="signin"], a[href*="login"]');
      
      if (await signInLink.isVisible()) {
        await signInLink.click();
        await page.waitForLoadState('networkidle');
      } else {
        // Try going directly to signin page
        await page.goto('http://localhost:3001/auth/signin');
        await page.waitForLoadState('networkidle');
      }
      
      await page.screenshot({ path: 'screenshots/auth-test-02-signin-page.png', fullPage: true });
    }
    
    console.log('4. Attempting to fill credentials...');
    
    // Wait for login form to be visible
    await usernameField.waitFor({ state: 'visible', timeout: 5000 });
    
    // Fill credentials
    await usernameField.fill('admin');
    await passwordField.fill('admin');
    
    await page.screenshot({ path: 'screenshots/auth-test-03-credentials-filled.png', fullPage: true });
    
    console.log('5. Submitting login form...');
    await loginButton.click();
    
    // Wait for navigation or response
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/auth-test-04-after-submit.png', fullPage: true });
    
    console.log('6. Checking for successful login...');
    
    // Check if we're redirected to dashboard or home
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('dashboard') || currentUrl === 'http://localhost:3001/') {
      console.log('✅ Login appears successful!');
      
      // Take screenshot of logged-in state
      await page.screenshot({ path: 'screenshots/auth-test-05-logged-in.png', fullPage: true });
      
      // Look for navigation or user interface elements
      console.log('7. Looking for navigation elements...');
      const navElements = await page.locator('nav, [role="navigation"], .nav, .navbar').all();
      console.log(`Found ${navElements.length} navigation elements`);
      
      // Look for user-specific elements
      const userElements = await page.locator('[data-testid*="user"], .user, #user, [class*="user"]').all();
      console.log(`Found ${userElements.length} user-related elements`);
      
      // Try to find Users section
      console.log('8. Looking for Users section...');
      const usersLink = page.locator('a:has-text("Users"), button:has-text("Users"), [href*="users"]');
      
      if (await usersLink.isVisible()) {
        console.log('Found Users link, clicking...');
        await usersLink.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/auth-test-06-users-page.png', fullPage: true });
        
        // Look for Add User button
        const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
        if (await addButton.isVisible()) {
          console.log('Found Add button, clicking...');
          await addButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'screenshots/auth-test-07-add-modal.png', fullPage: true });
        }
      }
      
      // Try Access Matrix
      console.log('9. Looking for Access Matrix...');
      const matrixLink = page.locator('a:has-text("Access"), a:has-text("Matrix"), [href*="access"], [href*="matrix"]');
      if (await matrixLink.isVisible()) {
        await matrixLink.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/auth-test-08-access-matrix.png', fullPage: true });
      }
      
    } else {
      console.log('❌ Login may have failed, still on signin page or error page');
      
      // Look for error messages
      const errorElements = await page.locator('.error, [class*="error"], [role="alert"]').all();
      if (errorElements.length > 0) {
        console.log('Found error elements:');
        for (const element of errorElements) {
          const text = await element.textContent();
          console.log('  - Error:', text);
        }
      }
    }
    
    console.log('✅ Authentication test completed!');
    
  } catch (error) {
    console.error('❌ Error during authentication test:', error);
    await page.screenshot({ path: 'screenshots/auth-test-error.png', fullPage: true });
  }
  
  await browser.close();
}

testAuthentication().catch(console.error);