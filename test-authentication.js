const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAuthentication() {
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, 'screenshots', 'auth-test');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const browser = await chromium.launch({ 
        headless: false, // Show browser for debugging
        slowMo: 1000 // Slow down actions for better visibility
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🚀 Starting authentication test...');
        
        // Step 1: Navigate to the application
        console.log('📍 Navigating to http://localhost:3000');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(screenshotsDir, '01-initial-page.png'), fullPage: true });
        
        // Step 2: Check if we're on login page or need to navigate to it
        console.log('🔍 Checking current page state...');
        const currentUrl = page.url();
        console.log('Current URL:', currentUrl);
        
        // Look for login form elements
        const loginForm = await page.locator('form').first();
        const usernameField = await page.locator('input[type="text"], input[name="username"], input[placeholder*="username" i]').first();
        const passwordField = await page.locator('input[type="password"], input[name="password"]').first();
        const loginButton = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
        
        if (await usernameField.isVisible()) {
            console.log('✅ Login form found');
            await page.screenshot({ path: path.join(screenshotsDir, '02-login-form.png'), fullPage: true });
            
            // Step 3: Fill in credentials
            console.log('📝 Filling in admin credentials...');
            await usernameField.fill('admin');
            await passwordField.fill('admin');
            await page.screenshot({ path: path.join(screenshotsDir, '03-credentials-filled.png'), fullPage: true });
            
            // Step 4: Submit the form
            console.log('🔑 Clicking Sign In button...');
            await loginButton.click();
            
            // Wait for navigation or response
            await page.waitForTimeout(3000);
            await page.screenshot({ path: path.join(screenshotsDir, '04-after-login-attempt.png'), fullPage: true });
            
        } else {
            console.log('❓ No login form visible, checking if already authenticated or different page structure');
        }
        
        // Step 5: Check if login was successful
        console.log('🔍 Checking authentication status...');
        const newUrl = page.url();
        console.log('URL after login attempt:', newUrl);
        
        // Look for navigation elements that indicate successful login
        const navElements = await page.locator('nav, [role="navigation"]').count();
        const dashboardElements = await page.locator('text=/dashboard/i, text=/users/i, text=/services/i').count();
        
        if (navElements > 0 || dashboardElements > 0) {
            console.log('✅ Login appears successful - found navigation elements');
            await page.screenshot({ path: path.join(screenshotsDir, '05-authenticated-dashboard.png'), fullPage: true });
            
            // Step 6: Test Users section
            console.log('👥 Testing Users section...');
            const usersLink = await page.locator('a:has-text("Users"), button:has-text("Users"), [href*="users"]').first();
            if (await usersLink.isVisible()) {
                await usersLink.click();
                await page.waitForTimeout(2000);
                await page.screenshot({ path: path.join(screenshotsDir, '06-users-section.png'), fullPage: true });
                
                // Look for Add User button
                const addUserButton = await page.locator('button:has-text("Add User"), button:has-text("New User"), button:has-text("Create User")').first();
                if (await addUserButton.isVisible()) {
                    console.log('📝 Found Add User button, testing modal...');
                    await addUserButton.click();
                    await page.waitForTimeout(1000);
                    await page.screenshot({ path: path.join(screenshotsDir, '07-add-user-modal.png'), fullPage: true });
                    
                    // Close modal if opened
                    const closeButton = await page.locator('[aria-label="Close"], button:has-text("Cancel"), button:has-text("×")').first();
                    if (await closeButton.isVisible()) {
                        await closeButton.click();
                        await page.waitForTimeout(500);
                    }
                } else {
                    console.log('❌ Add User button not found');
                }
                
                // Look for Edit User buttons
                const editButtons = await page.locator('button:has-text("Edit"), [aria-label*="edit"]').count();
                if (editButtons > 0) {
                    console.log('✏️ Found Edit buttons, testing edit modal...');
                    await page.locator('button:has-text("Edit"), [aria-label*="edit"]').first().click();
                    await page.waitForTimeout(1000);
                    await page.screenshot({ path: path.join(screenshotsDir, '08-edit-user-modal.png'), fullPage: true });
                    
                    // Close modal
                    const closeEditButton = await page.locator('[aria-label="Close"], button:has-text("Cancel"), button:has-text("×")').first();
                    if (await closeEditButton.isVisible()) {
                        await closeEditButton.click();
                        await page.waitForTimeout(500);
                    }
                } else {
                    console.log('❌ Edit buttons not found in Users section');
                }
            } else {
                console.log('❌ Users section not accessible');
            }
            
            // Step 7: Test Services section
            console.log('🔧 Testing Services section...');
            const servicesLink = await page.locator('a:has-text("Services"), button:has-text("Services"), [href*="services"]').first();
            if (await servicesLink.isVisible()) {
                await servicesLink.click();
                await page.waitForTimeout(2000);
                await page.screenshot({ path: path.join(screenshotsDir, '09-services-section.png'), fullPage: true });
                
                // Look for Add Service button
                const addServiceButton = await page.locator('button:has-text("Add Service"), button:has-text("New Service"), button:has-text("Create Service")').first();
                if (await addServiceButton.isVisible()) {
                    console.log('🔧 Found Add Service button, testing modal...');
                    await addServiceButton.click();
                    await page.waitForTimeout(1000);
                    await page.screenshot({ path: path.join(screenshotsDir, '10-add-service-modal.png'), fullPage: true });
                    
                    // Close modal
                    const closeServiceButton = await page.locator('[aria-label="Close"], button:has-text("Cancel"), button:has-text("×")').first();
                    if (await closeServiceButton.isVisible()) {
                        await closeServiceButton.click();
                        await page.waitForTimeout(500);
                    }
                } else {
                    console.log('❌ Add Service button not found');
                }
            } else {
                console.log('❌ Services section not accessible');
            }
            
            // Step 8: Test Access Matrix functionality
            console.log('🔗 Testing Access Matrix section...');
            const accessMatrixLink = await page.locator('a:has-text("Access Matrix"), button:has-text("Access Matrix"), [href*="access-matrix"]').first();
            if (await accessMatrixLink.isVisible()) {
                await accessMatrixLink.click();
                await page.waitForTimeout(2000);
                await page.screenshot({ path: path.join(screenshotsDir, '11-access-matrix.png'), fullPage: true });
                console.log('✅ Access Matrix section accessible');
            } else {
                console.log('❌ Access Matrix section not found');
            }
            
            // Step 9: Test other main navigation items
            console.log('🧭 Testing other navigation sections...');
            const mainSections = ['Dashboard', 'Analytics', 'VPN', 'Compliance', 'Settings'];
            
            for (const section of mainSections) {
                const sectionLink = await page.locator(`a:has-text("${section}"), button:has-text("${section}"), [href*="${section.toLowerCase()}"]`).first();
                if (await sectionLink.isVisible()) {
                    console.log(`📊 Testing ${section} section...`);
                    await sectionLink.click();
                    await page.waitForTimeout(1000);
                    await page.screenshot({ path: path.join(screenshotsDir, `12-${section.toLowerCase()}-section.png`), fullPage: true });
                } else {
                    console.log(`❌ ${section} section not found`);
                }
            }
            
        } else {
            console.log('❌ Login failed or page structure different than expected');
            
            // Check for error messages
            const errorMessages = await page.locator('[role="alert"], .error, .alert-error, [class*="error"]').allTextContents();
            if (errorMessages.length > 0) {
                console.log('⚠️ Error messages found:', errorMessages);
            }
            
            await page.screenshot({ path: path.join(screenshotsDir, '05-login-failed.png'), fullPage: true });
        }
        
        // Step 10: Final application overview
        console.log('📸 Taking final application overview screenshots...');
        await page.screenshot({ path: path.join(screenshotsDir, '13-final-overview.png'), fullPage: true });
        
        // Get page title and any console errors
        const pageTitle = await page.title();
        console.log('📄 Page title:', pageTitle);
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        await page.screenshot({ path: path.join(screenshotsDir, 'error-screenshot.png'), fullPage: true });
    }
    
    await browser.close();
    console.log('🏁 Test completed. Screenshots saved to:', screenshotsDir);
}

// Run the test
testAuthentication().catch(console.error);