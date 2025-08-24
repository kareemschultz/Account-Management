const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAuthSimple() {
    const screenshotsDir = path.join(__dirname, 'screenshots', 'auth-simple');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🚀 Testing authentication with simple selectors...');
        
        // Navigate to login page
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(screenshotsDir, '01-login-page.png'), fullPage: true });
        
        console.log('Current URL:', page.url());
        
        // Wait for page to be ready
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        
        // Get all input elements and inspect them
        const inputs = await page.locator('input').all();
        console.log(`Found ${inputs.length} input elements`);
        
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const type = await input.getAttribute('type');
            const id = await input.getAttribute('id');
            const name = await input.getAttribute('name');
            const placeholder = await input.getAttribute('placeholder');
            console.log(`Input ${i + 1}: type=${type}, id=${id}, name=${name}, placeholder="${placeholder}"`);
        }
        
        // Try to fill the first input (should be username)
        if (inputs.length >= 2) {
            console.log('📝 Filling username field...');
            await inputs[0].fill('admin@esm.com');
            
            console.log('📝 Filling password field...');
            await inputs[1].fill('admin');
            
            await page.screenshot({ path: path.join(screenshotsDir, '02-filled-form.png'), fullPage: true });
            
            // Find and click the submit button
            const submitButton = await page.locator('button[type="submit"]').first();
            if (await submitButton.isVisible()) {
                console.log('🔑 Clicking submit button...');
                await submitButton.click();
                
                // Wait for response
                await page.waitForTimeout(5000);
                
                const newUrl = page.url();
                console.log('URL after submit:', newUrl);
                
                await page.screenshot({ path: path.join(screenshotsDir, '03-after-submit.png'), fullPage: true });
                
                if (!newUrl.includes('/auth/signin')) {
                    console.log('✅ LOGIN SUCCESSFUL! Testing application...');
                    
                    // Test navigation
                    const navLinks = await page.locator('nav a, a[href*="/"]').all();
                    console.log(`Found ${navLinks.length} navigation links`);
                    
                    // Try to navigate to Users section
                    const usersLink = page.locator('a:has-text("Users")').first();
                    if (await usersLink.isVisible()) {
                        console.log('👥 Navigating to Users section...');
                        await usersLink.click();
                        await page.waitForTimeout(2000);
                        await page.screenshot({ path: path.join(screenshotsDir, '04-users-section.png'), fullPage: true });
                        
                        // Look for any buttons on the users page
                        const buttons = await page.locator('button').all();
                        console.log(`Found ${buttons.length} buttons on Users page`);
                        
                        for (let i = 0; i < Math.min(buttons.length, 5); i++) {
                            const button = buttons[i];
                            const text = await button.textContent();
                            const visible = await button.isVisible();
                            console.log(`Button ${i + 1}: "${text}" (visible: ${visible})`);
                        }
                    }
                    
                    // Try to navigate to Services section
                    const servicesLink = page.locator('a:has-text("Services")').first();
                    if (await servicesLink.isVisible()) {
                        console.log('🔧 Navigating to Services section...');
                        await servicesLink.click();
                        await page.waitForTimeout(2000);
                        await page.screenshot({ path: path.join(screenshotsDir, '05-services-section.png'), fullPage: true });
                    }
                    
                    // Try Access Matrix
                    const accessMatrixLink = page.locator('a:has-text("Access Matrix")').first();
                    if (await accessMatrixLink.isVisible()) {
                        console.log('🔗 Navigating to Access Matrix...');
                        await accessMatrixLink.click();
                        await page.waitForTimeout(2000);
                        await page.screenshot({ path: path.join(screenshotsDir, '06-access-matrix.png'), fullPage: true });
                    }
                    
                } else {
                    console.log('❌ Login failed - still on signin page');
                    
                    // Check for error messages
                    const alerts = await page.locator('[role="alert"]').all();
                    for (const alert of alerts) {
                        const text = await alert.textContent();
                        console.log('Error message:', text);
                    }
                }
            } else {
                console.log('❌ Submit button not found');
            }
        } else {
            console.log('❌ Not enough input fields found');
        }
        
        await page.screenshot({ path: path.join(screenshotsDir, '07-final-state.png'), fullPage: true });
        
    } catch (error) {
        console.error('❌ Error:', error);
        await page.screenshot({ path: path.join(screenshotsDir, 'error.png'), fullPage: true });
    }
    
    await browser.close();
    console.log('🏁 Test completed. Screenshots saved to:', screenshotsDir);
}

testAuthSimple().catch(console.error);