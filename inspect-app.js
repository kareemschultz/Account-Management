const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function inspectApp() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  console.log('Starting inspection of Account Management Platform...');

  try {
    // 1. Navigate to homepage/dashboard
    console.log('1. Loading homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });
    console.log('   Screenshot saved: 01-homepage.png');

    // Check if we're redirected to auth
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('signin') || currentUrl.includes('auth')) {
      console.log('   Detected authentication redirect');
      await page.screenshot({ path: 'screenshots/02-auth-signin.png', fullPage: true });
      console.log('   Screenshot saved: 02-auth-signin.png');
      
      // Try to find and interact with auth elements
      const authElements = await page.$$('[data-testid], input, button');
      console.log(`   Found ${authElements.length} interactive elements on auth page`);
      
      // Look for common auth patterns
      const emailInput = await page.$('input[type="email"], input[name="email"], #email');
      const passwordInput = await page.$('input[type="password"], input[name="password"], #password');
      const signinButton = await page.$('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
      
      console.log(`   Email input: ${emailInput ? 'Found' : 'Not found'}`);
      console.log(`   Password input: ${passwordInput ? 'Found' : 'Not found'}`);
      console.log(`   Sign in button: ${signinButton ? 'Found' : 'Not found'}`);
    }

    // 2. Try to navigate to different sections (even if auth is required)
    const sections = [
      { name: 'Users', path: '/users' },
      { name: 'Services', path: '/services' },
      { name: 'Access Matrix', path: '/access-matrix' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'VPN', path: '/vpn' },
      { name: 'Compliance', path: '/compliance' },
      { name: 'Analytics', path: '/analytics' },
      { name: 'Settings', path: '/settings' }
    ];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      console.log(`${i + 3}. Testing ${section.name} section...`);
      
      try {
        await page.goto(`http://localhost:3000${section.path}`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(1500);
        
        const screenshotNum = String(i + 3).padStart(2, '0');
        const filename = `${screenshotNum}-${section.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        await page.screenshot({ path: `screenshots/${filename}`, fullPage: true });
        console.log(`   Screenshot saved: ${filename}`);
        
        // Check for specific elements
        const buttons = await page.$$('button');
        const links = await page.$$('a');
        const modals = await page.$$('[role="dialog"], .modal, [data-testid*="modal"]');
        const tables = await page.$$('table, [role="table"]');
        const forms = await page.$$('form');
        
        console.log(`   Interactive elements found:`);
        console.log(`     - Buttons: ${buttons.length}`);
        console.log(`     - Links: ${links.length}`);
        console.log(`     - Modals: ${modals.length}`);
        console.log(`     - Tables: ${tables.length}`);
        console.log(`     - Forms: ${forms.length}`);
        
        // Try to click on "Add" or "Create" buttons if found
        const addButtons = await page.$$('button:has-text("Add"), button:has-text("Create"), button:has-text("New")');
        if (addButtons.length > 0) {
          console.log(`     - Found ${addButtons.length} Add/Create buttons`);
          try {
            await addButtons[0].click();
            await page.waitForTimeout(1000);
            const modalScreenshot = `${screenshotNum}-${section.name.toLowerCase().replace(/\s+/g, '-')}-modal.png`;
            await page.screenshot({ path: `screenshots/${modalScreenshot}`, fullPage: true });
            console.log(`     - Modal screenshot saved: ${modalScreenshot}`);
            
            // Close modal by pressing Escape or clicking close button
            const closeButton = await page.$('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]');
            if (closeButton) {
              await closeButton.click();
            } else {
              await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(500);
          } catch (error) {
            console.log(`     - Could not interact with Add button: ${error.message}`);
          }
        }
        
      } catch (error) {
        console.log(`   Error accessing ${section.name}: ${error.message}`);
      }
    }

    // 3. Test API endpoints
    console.log('\nTesting API endpoints...');
    const apiEndpoints = [
      '/api/health',
      '/api/users',
      '/api/services',
      '/api/monitoring/health'
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await page.goto(`http://localhost:3000${endpoint}`, { waitUntil: 'networkidle' });
        console.log(`   ${endpoint}: ${response.status()} ${response.statusText()}`);
        
        if (response.status() === 200) {
          const content = await page.content();
          if (content.includes('{') && content.includes('}')) {
            console.log('     - JSON response detected');
          }
        }
      } catch (error) {
        console.log(`   ${endpoint}: Error - ${error.message}`);
      }
    }

    // 4. Test responsive design by changing viewport
    console.log('\nTesting responsive design...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: `screenshots/responsive-${viewport.name}-${viewport.width}x${viewport.height}.png`, 
        fullPage: true 
      });
      console.log(`   Responsive screenshot saved: responsive-${viewport.name}-${viewport.width}x${viewport.height}.png`);
    }

  } catch (error) {
    console.error('Error during inspection:', error);
  } finally {
    console.log('\nInspection complete. Check the screenshots directory for visual results.');
    await browser.close();
  }
}

// Run the inspection
inspectApp().catch(console.error);