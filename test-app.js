const { chromium } = require('playwright');

async function testApplication() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Taking screenshot of initial page...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/01-initial-page.png', fullPage: true });
    
    console.log('2. Looking for login form...');
    // Check if we're already logged in or need to log in
    const loginForm = await page.locator('input[type="text"], input[type="email"]').first();
    
    if (await loginForm.isVisible()) {
      console.log('3. Found login form, attempting to log in...');
      
      // Fill username
      await loginForm.fill('admin');
      
      // Fill password
      const passwordInput = await page.locator('input[type="password"]').first();
      await passwordInput.fill('admin');
      
      // Take screenshot before clicking login
      await page.screenshot({ path: 'screenshots/02-before-login.png', fullPage: true });
      
      // Click login button
      const loginButton = await page.locator('button:has-text("Sign In"), button:has-text("Login"), button[type="submit"]').first();
      await loginButton.click();
      
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/03-after-login.png', fullPage: true });
    } else {
      console.log('3. No login form found, checking if already logged in...');
      await page.screenshot({ path: 'screenshots/02-no-login-form.png', fullPage: true });
    }

    console.log('4. Testing main dashboard...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/04-dashboard.png', fullPage: true });
    
    console.log('5. Looking for Users section...');
    // Try to find and click Users navigation
    const usersLink = await page.locator('a:has-text("Users"), button:has-text("Users"), [href*="users"]').first();
    
    if (await usersLink.isVisible()) {
      await usersLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/05-users-page.png', fullPage: true });
      
      console.log('6. Looking for Add User button...');
      const addUserButton = await page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
      
      if (await addUserButton.isVisible()) {
        await addUserButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/06-add-user-modal.png', fullPage: true });
        
        // Try to close modal
        const closeButton = await page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    } else {
      console.log('6. Users section not found, checking navigation...');
    }

    console.log('7. Testing Access Matrix page...');
    const accessMatrixLink = await page.locator('a:has-text("Access"), a:has-text("Matrix"), [href*="access"], [href*="matrix"]').first();
    
    if (await accessMatrixLink.isVisible()) {
      await accessMatrixLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/07-access-matrix.png', fullPage: true });
    } else {
      console.log('Access Matrix link not found');
    }

    console.log('8. Taking final screenshots...');
    
    // Take screenshots of different sections
    const navLinks = await page.locator('nav a, .nav a, [role="navigation"] a').all();
    for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
      try {
        await navLinks[i].click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `screenshots/08-section-${i+1}.png`, fullPage: true });
      } catch (e) {
        console.log(`Could not click nav link ${i+1}:`, e.message);
      }
    }

    console.log('Testing completed successfully!');
    
  } catch (error) {
    console.error('Error during testing:', error);
    await page.screenshot({ path: 'screenshots/error-state.png', fullPage: true });
  }
  
  await browser.close();
}

testApplication().catch(console.error);