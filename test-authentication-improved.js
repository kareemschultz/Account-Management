const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAuthenticationImproved() {
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, 'screenshots', 'auth-test-improved');
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
        console.log('🚀 Starting improved authentication test...');
        
        // Step 1: Navigate to the application
        console.log('📍 Navigating to http://localhost:3000');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(screenshotsDir, '01-initial-page.png'), fullPage: true });
        
        // Step 2: Wait for login form to be visible
        console.log('⏳ Waiting for login form...');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000); // Give time for React to render
        
        // Log current URL
        console.log('Current URL:', page.url());
        
        // Step 3: Look for form elements more specifically
        const forms = await page.locator('form').count();
        console.log(`Found ${forms} forms on the page`);
        
        const inputs = await page.locator('input').count();
        console.log(`Found ${inputs} input fields on the page`);
        
        // Try multiple selectors for username field
        let usernameField = null;
        const usernameSelectors = [
            'input[name="username"]',
            'input[type="text"]',
            'input[placeholder*="username" i]',
            'input[placeholder*="email" i]',
            'input:first-of-type'
        ];
        
        for (const selector of usernameSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
                usernameField = element;
                console.log(`✅ Found username field with selector: ${selector}`);
                break;
            }
        }
        
        // Try multiple selectors for password field
        let passwordField = null;
        const passwordSelectors = [
            'input[name="password"]',
            'input[type="password"]',
            'input[placeholder*="password" i]'
        ];
        
        for (const selector of passwordSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
                passwordField = element;
                console.log(`✅ Found password field with selector: ${selector}`);
                break;
            }
        }
        
        // Try multiple selectors for submit button
        let submitButton = null;
        const buttonSelectors = [
            'button[type="submit"]',
            'button:has-text("Sign In")',
            'button:has-text("Login")',
            'input[type="submit"]',
            'button:visible'
        ];
        
        for (const selector of buttonSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
                submitButton = element;
                console.log(`✅ Found submit button with selector: ${selector}`);
                break;
            }
        }
        
        if (usernameField && passwordField && submitButton) {
            console.log('✅ All form elements found, proceeding with login...');
            
            // Clear and fill username
            await usernameField.clear();
            await usernameField.fill('admin');
            console.log('📝 Username filled: admin');
            
            // Clear and fill password  
            await passwordField.clear();
            await passwordField.fill('admin');
            console.log('📝 Password filled: admin');
            
            await page.screenshot({ path: path.join(screenshotsDir, '02-credentials-filled.png'), fullPage: true });
            
            // Submit the form
            console.log('🔑 Clicking submit button...');
            await submitButton.click();
            
            // Wait for navigation or authentication
            console.log('⏳ Waiting for authentication response...');
            
            try {
                // Wait for either successful redirect or error message
                await Promise.race([
                    page.waitForURL(url => !url.includes('/auth/signin'), { timeout: 10000 }),
                    page.waitForSelector('[role="alert"], .error', { timeout: 10000 }),
                ]);
            } catch (e) {
                console.log('⏳ No immediate redirect or error, continuing...');
            }
            
            await page.waitForTimeout(3000); // Give time for any redirects
            await page.screenshot({ path: path.join(screenshotsDir, '03-after-login-attempt.png'), fullPage: true });
            
        } else {
            console.log('❌ Could not find all required form elements');
            console.log(`Username field found: ${!!usernameField}`);
            console.log(`Password field found: ${!!passwordField}`);
            console.log(`Submit button found: ${!!submitButton}`);
            
            // Take a screenshot of the page for debugging
            await page.screenshot({ path: path.join(screenshotsDir, '02-form-elements-not-found.png'), fullPage: true });
            
            // Get page content for debugging
            const pageContent = await page.content();
            fs.writeFileSync(path.join(screenshotsDir, 'page-source.html'), pageContent);
        }
        
        // Step 4: Check authentication status
        const finalUrl = page.url();
        console.log('Final URL:', finalUrl);
        
        if (!finalUrl.includes('/auth/signin')) {
            console.log('✅ Successfully redirected from login page!');
            
            // Take screenshot of the authenticated page
            await page.screenshot({ path: path.join(screenshotsDir, '04-authenticated-page.png'), fullPage: true });
            
            // Step 5: Test navigation to different sections
            const sections = ['Users', 'Services', 'Access Matrix', 'Dashboard'];
            
            for (const section of sections) {
                try {
                    console.log(`🔍 Testing ${section} section...`);
                    
                    // Look for navigation links
                    const navLink = page.locator(`nav a:has-text("${section}"), [href*="${section.toLowerCase().replace(' ', '-')}"]`).first();
                    
                    if (await navLink.isVisible()) {
                        await navLink.click();
                        await page.waitForTimeout(1000);
                        await page.screenshot({ 
                            path: path.join(screenshotsDir, `05-${section.toLowerCase().replace(' ', '-')}-section.png`), 
                            fullPage: true 
                        });
                        console.log(`✅ ${section} section accessed`);
                        
                        // Look for specific functionality in each section
                        if (section === 'Users') {
                            const addUserBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
                            if (await addUserBtn.isVisible()) {
                                console.log('📝 Found Add User button');
                                await addUserBtn.click();
                                await page.waitForTimeout(1000);
                                await page.screenshot({ path: path.join(screenshotsDir, '06-add-user-modal.png'), fullPage: true });
                                
                                // Close modal if it opened
                                const closeBtn = page.locator('[aria-label="Close"], button:has-text("Cancel"), [data-dismiss]').first();
                                if (await closeBtn.isVisible()) {
                                    await closeBtn.click();
                                }
                            }
                        }
                        
                        if (section === 'Services') {
                            const addServiceBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
                            if (await addServiceBtn.isVisible()) {
                                console.log('🔧 Found Add Service button');
                                await addServiceBtn.click();
                                await page.waitForTimeout(1000);
                                await page.screenshot({ path: path.join(screenshotsDir, '07-add-service-modal.png'), fullPage: true });
                                
                                // Close modal if it opened
                                const closeBtn = page.locator('[aria-label="Close"], button:has-text("Cancel"), [data-dismiss]').first();
                                if (await closeBtn.isVisible()) {
                                    await closeBtn.click();
                                }
                            }
                        }
                    } else {
                        console.log(`❌ ${section} section not accessible`);
                    }
                } catch (error) {
                    console.log(`❌ Error testing ${section}: ${error.message}`);
                }
            }
            
        } else {
            console.log('❌ Still on login page - authentication may have failed');
            
            // Check for error messages
            const errorMessages = await page.locator('[role="alert"], .error, .text-red-500, .text-danger').allTextContents();
            if (errorMessages.length > 0) {
                console.log('⚠️ Error messages found:', errorMessages);
            }
        }
        
        // Step 6: Final overview
        await page.screenshot({ path: path.join(screenshotsDir, '08-final-overview.png'), fullPage: true });
        
        // Get page title
        const pageTitle = await page.title();
        console.log('📄 Final page title:', pageTitle);
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        await page.screenshot({ path: path.join(screenshotsDir, 'error-screenshot.png'), fullPage: true });
    }
    
    await browser.close();
    console.log('🏁 Test completed. Screenshots saved to:', screenshotsDir);
}

// Run the improved test
testAuthenticationImproved().catch(console.error);