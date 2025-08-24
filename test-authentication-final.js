const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAuthenticationFinal() {
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, 'screenshots', 'auth-test-final');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const browser = await chromium.launch({ 
        headless: false, // Show browser for debugging
        slowMo: 500 // Slow down actions for better visibility
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🚀 Starting final authentication test...');
        
        // Step 1: Navigate to the application
        console.log('📍 Navigating to http://localhost:3000');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(screenshotsDir, '01-initial-page.png'), fullPage: true });
        
        console.log('Current URL:', page.url());
        
        // Step 2: Wait for the form and fill it properly
        console.log('⏳ Waiting for login form...');
        await page.waitForSelector('input[type="text"]', { timeout: 10000 });
        await page.waitForSelector('input[type="password"]', { timeout: 10000 });
        await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
        
        // Test multiple credential combinations
        const testCredentials = [
            { username: 'admin@esm.com', password: 'admin', description: 'admin email format' },
            { username: 'admin', password: 'admin', description: 'admin username' }
        ];
        
        for (let i = 0; i < testCredentials.length; i++) {
            const creds = testCredentials[i];
            console.log(`\n🔑 Testing ${creds.description}...`);
            
            // Clear and fill the form
            await page.locator('input[type="text"]').clear();
            await page.locator('input[type="text"]').fill(creds.username);
            
            await page.locator('input[type="password"]').clear();
            await page.locator('input[type="password"]').fill(creds.password);
            
            console.log(`📝 Filled username: ${creds.username}, password: ${creds.password}`);
            
            await page.screenshot({ path: path.join(screenshotsDir, `02-credentials-filled-${i + 1}.png`), fullPage: true });
            
            // Submit the form
            await page.locator('button[type="submit"]').click();
            console.log('🔑 Form submitted');
            
            // Wait for response
            await page.waitForTimeout(3000);
            
            const currentUrl = page.url();
            console.log('URL after login attempt:', currentUrl);
            
            // Check if we're redirected (successful login)
            if (!currentUrl.includes('/auth/signin')) {
                console.log('✅ LOGIN SUCCESSFUL! Redirected from signin page');
                await page.screenshot({ path: path.join(screenshotsDir, `03-successful-login-${i + 1}.png`), fullPage: true });
                break; // Exit loop on successful login
            } else {
                console.log('❌ Login failed, still on signin page');
                
                // Check for error messages
                const errorElements = await page.locator('[role="alert"], .text-red-600, .text-red-500').allTextContents();
                if (errorElements.length > 0) {
                    console.log('Error messages:', errorElements);
                }
                
                await page.screenshot({ path: path.join(screenshotsDir, `03-login-failed-${i + 1}.png`), fullPage: true });
                
                // If this isn't the last attempt, wait a bit before next try
                if (i < testCredentials.length - 1) {
                    await page.waitForTimeout(1000);
                }
            }
        }
        
        // Step 3: If we're successfully authenticated, test the application
        const finalUrl = page.url();
        if (!finalUrl.includes('/auth/signin')) {
            console.log('\n🎉 AUTHENTICATION SUCCESSFUL! Testing application features...');
            
            // Wait for the page to fully load
            await page.waitForLoadState('networkidle');
            await page.screenshot({ path: path.join(screenshotsDir, '04-authenticated-dashboard.png'), fullPage: true });
            
            // Test navigation sections
            const navigationTests = [
                { name: 'Dashboard', selector: 'a[href="/dashboard"], a:has-text("Dashboard")' },
                { name: 'Users', selector: 'a[href="/users"], a:has-text("Users")' },
                { name: 'Services', selector: 'a[href="/services"], a:has-text("Services")' },
                { name: 'Access Matrix', selector: 'a[href="/access-matrix"], a:has-text("Access Matrix")' }
            ];
            
            for (const test of navigationTests) {
                try {
                    console.log(`\n📋 Testing ${test.name} section...`);
                    
                    const navLink = page.locator(test.selector).first();
                    if (await navLink.isVisible()) {
                        await navLink.click();
                        await page.waitForTimeout(2000);
                        
                        const sectionUrl = page.url();
                        console.log(`✅ Navigated to ${test.name}: ${sectionUrl}`);
                        
                        await page.screenshot({ 
                            path: path.join(screenshotsDir, `05-${test.name.toLowerCase().replace(' ', '-')}-section.png`), 
                            fullPage: true 
                        });
                        
                        // Test specific functionality for each section
                        if (test.name === 'Users') {
                            console.log('🔍 Looking for Add User functionality...');
                            
                            // Look for Add User button with multiple selectors
                            const addUserButtons = [
                                'button:has-text("Add User")',
                                'button:has-text("New User")',
                                'button:has-text("Create User")',
                                'button:has-text("Add")',
                                '[data-testid="add-user"]'
                            ];
                            
                            for (const selector of addUserButtons) {
                                const addBtn = page.locator(selector).first();
                                if (await addBtn.isVisible()) {
                                    console.log(`✅ Found Add User button: ${selector}`);
                                    await addBtn.click();
                                    await page.waitForTimeout(1000);
                                    
                                    // Check if modal opened
                                    const modal = page.locator('[role="dialog"], .modal, [data-testid="user-modal"]').first();
                                    if (await modal.isVisible()) {
                                        console.log('✅ Add User modal opened successfully');
                                        await page.screenshot({ path: path.join(screenshotsDir, '06-add-user-modal.png'), fullPage: true });
                                        
                                        // Close modal
                                        const closeButton = page.locator('[aria-label="Close"], button:has-text("Cancel"), [data-testid="close-modal"]').first();
                                        if (await closeButton.isVisible()) {
                                            await closeButton.click();
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        
                        if (test.name === 'Services') {
                            console.log('🔍 Looking for Add Service functionality...');
                            
                            const addServiceButtons = [
                                'button:has-text("Add Service")',
                                'button:has-text("New Service")',
                                'button:has-text("Create Service")',
                                'button:has-text("Add")',
                                '[data-testid="add-service"]'
                            ];
                            
                            for (const selector of addServiceButtons) {
                                const addBtn = page.locator(selector).first();
                                if (await addBtn.isVisible()) {
                                    console.log(`✅ Found Add Service button: ${selector}`);
                                    await addBtn.click();
                                    await page.waitForTimeout(1000);
                                    
                                    // Check if modal opened
                                    const modal = page.locator('[role="dialog"], .modal, [data-testid="service-modal"]').first();
                                    if (await modal.isVisible()) {
                                        console.log('✅ Add Service modal opened successfully');
                                        await page.screenshot({ path: path.join(screenshotsDir, '07-add-service-modal.png'), fullPage: true });
                                        
                                        // Close modal
                                        const closeButton = page.locator('[aria-label="Close"], button:has-text("Cancel"), [data-testid="close-modal"]').first();
                                        if (await closeButton.isVisible()) {
                                            await closeButton.click();
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        
                    } else {
                        console.log(`❌ ${test.name} navigation link not found`);
                    }
                } catch (error) {
                    console.log(`❌ Error testing ${test.name}: ${error.message}`);
                }
            }
            
            // Test user profile/session info
            console.log('\n👤 Checking user session information...');
            const userInfo = page.locator('[data-testid="user-info"], .user-profile, .user-name').first();
            if (await userInfo.isVisible()) {
                const userName = await userInfo.textContent();
                console.log(`✅ User logged in as: ${userName}`);
            }
            
        } else {
            console.log('\n❌ AUTHENTICATION FAILED - Could not log in with any credentials');
        }
        
        // Final screenshot
        await page.screenshot({ path: path.join(screenshotsDir, '08-final-state.png'), fullPage: true });
        
        // Get final page info
        const pageTitle = await page.title();
        console.log(`\n📄 Final page title: ${pageTitle}`);
        console.log(`📍 Final URL: ${page.url()}`);
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        await page.screenshot({ path: path.join(screenshotsDir, 'error-screenshot.png'), fullPage: true });
    }
    
    await browser.close();
    console.log(`\n🏁 Test completed. Screenshots saved to: ${screenshotsDir}`);
}

// Run the final test
testAuthenticationFinal().catch(console.error);