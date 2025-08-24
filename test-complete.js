const { chromium } = require('playwright');

async function testCompleteApplication() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Testing homepage and navigation...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/complete-01-homepage-with-nav.png', fullPage: true });
    
    console.log('2. Testing sign-in functionality...');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.screenshot({ path: 'screenshots/complete-02-credentials-filled.png', fullPage: true });
    
    // Click sign in
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/complete-03-after-signin.png', fullPage: true });
    
    console.log('3. Testing navigation - Users section...');
    const usersLink = page.locator('a:has-text("Users")');
    if (await usersLink.isVisible()) {
      await usersLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/complete-04-users-page.png', fullPage: true });
      
      // Look for action buttons
      console.log('4. Looking for user management buttons...');
      const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
      if (await addButton.isVisible()) {
        console.log('Found Add User button!');
        await addButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/complete-05-add-user-modal.png', fullPage: true });
        
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
    
    console.log('5. Testing Access Matrix...');
    const accessMatrixLink = page.locator('a:has-text("Access Matrix")');
    if (await accessMatrixLink.isVisible()) {
      await accessMatrixLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/complete-06-access-matrix.png', fullPage: true });
    }
    
    console.log('6. Testing Services section...');
    const servicesLink = page.locator('a:has-text("Services")');
    if (await servicesLink.isVisible()) {
      await servicesLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/complete-07-services.png', fullPage: true });
    }
    
    console.log('7. Testing Dashboard...');
    const dashboardLink = page.locator('a:has-text("Dashboard")');
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/complete-08-dashboard.png', fullPage: true });
    }
    
    console.log('8. Testing VPN Management...');
    const vpnLink = page.locator('a:has-text("VPN Management")');
    if (await vpnLink.isVisible()) {
      await vpnLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/complete-09-vpn-management.png', fullPage: true });
    }
    
    console.log('9. Testing Analytics...');
    const analyticsLink = page.locator('a:has-text("Analytics")');
    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/complete-10-analytics.png', fullPage: true });
    }
    
    console.log('10. Testing Settings...');
    const settingsLink = page.locator('a:has-text("Settings")');
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/complete-11-settings.png', fullPage: true });
    }
    
    console.log('11. Testing responsive design...');
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await page.screenshot({ path: 'screenshots/complete-12-tablet-view.png', fullPage: true });
    
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.screenshot({ path: 'screenshots/complete-13-mobile-view.png', fullPage: true });
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: 'screenshots/complete-14-desktop-final.png', fullPage: true });
    
    console.log('✅ Complete application testing finished!');
    console.log('📸 Screenshots saved showing:');
    console.log('   - Homepage with navigation');
    console.log('   - Authentication flow');
    console.log('   - Users management');
    console.log('   - Access Matrix');
    console.log('   - Services');
    console.log('   - Dashboard');
    console.log('   - VPN Management');
    console.log('   - Analytics');
    console.log('   - Settings');
    console.log('   - Responsive design (tablet/mobile)');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    await page.screenshot({ path: 'screenshots/complete-error.png', fullPage: true });
  }
  
  await browser.close();
}

testCompleteApplication().catch(console.error);