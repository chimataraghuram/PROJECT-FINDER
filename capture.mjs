import { chromium } from 'playwright';

(async () => {
    // Launch headless true but add animations scale delay if needed
    const browser = await chromium.launch({ headless: true });
    // Increased device scale factor for sharper images
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
    });

    const page = await context.newPage();

    try {
        console.log('Navigating to local server...');
        await page.goto('http://localhost:3002/');

        // Wait completely for the initial render and animations to settle
        await page.waitForTimeout(3000);

        console.log('Taking full website (Home) screenshot...');
        await page.screenshot({ path: 'public/main_search.png', fullPage: true });

        console.log('Searching for projects...');
        // Fill the search bar 
        await page.fill('input[type="text"]', 'React UI components');
        await page.keyboard.press('Enter');

        // Give the mock network response and the CSS scale animations plenty of time
        await page.waitForTimeout(4000);

        console.log('Taking results screenshot...');
        await page.screenshot({ path: 'public/results.png', fullPage: true });

        // Let's also refresh, open Techboy AI and take a shot
        await page.goto('http://localhost:3002/');
        await page.waitForTimeout(3000); // wait for initial render

        console.log('Opening Techboy AI...');
        await page.click('button[title="TECHBOY AI"]');

        // Wait for the modal glass blur and CSS transitions to fully finish
        await page.waitForTimeout(2500);

        console.log('Taking Techboy AI screenshot...');
        await page.screenshot({ path: 'public/techboy_ai.png', fullPage: true });

        console.log('Screenshots captured successfully!');
    } catch (err) {
        console.error('Error during capture:', err);
    } finally {
        await browser.close();
    }
})();
