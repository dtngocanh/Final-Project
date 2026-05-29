const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('Dat hang tu dong - Stable Checkout Flow', async () => {
    test.setTimeout(0);

    const dataDir = path.join(__dirname, '../data');
    const accountsFile = path.join(dataDir, 'accounts.json');

    if (!fs.existsSync(accountsFile)) {
        console.error('Không tìm thấy file accounts.json!');
        return;
    }

    const originalAccounts = JSON.parse(
        fs.readFileSync(accountsFile, 'utf8')
    );

    const totalOriginal = originalAccounts.length;

    const accountsWithIndex = originalAccounts.map((user, idx) => ({
        ...user,
        realIndex: idx + 1
    }));

    const accountsList = accountsWithIndex.filter(
        user => user.realIndex >= 0 && user.realIndex <= 200
    );

    const streets = [
        'Tran Dai Nghia',
        'Le Duan',
        'Nguyen Van Linh',
        'Dien Bien Phu',
        'Hai Ba Trung',
        'Cach Mang Thang Tam',
        'Bui Vien',
        'Nguyen Hue',
        'Phan Chu Trinh',
        'Ly Tu Trong',
        'Hoang Dieu',
        'Tran Hung Dao'
    ];

    console.log(`🚀 Start automation [300 -> 500]`);
    console.log(`📦 Total accounts: ${accountsList.length}`);

    const isHeaded = process.env.HEADED !== 'false';

    const browser = await chromium.launch({
        headless: !isHeaded,
        slowMo: isHeaded ? 200 : 50
    });

    for (const user of accountsList) {

        if (user.realIndex === 499) {
            console.log(`[BỎ QUA] USER ${user.realIndex}`);
            continue;
        }

        const context = await browser.newContext({
            viewport: {
                width: 1280,
                height: 720
            }
        });

        const page = await context.newPage();

        console.log(
            `\n👉 [${user.realIndex}/${totalOriginal}] ${user.email}`
        );

        try {

            // ====================================================
            // HOME
            // ====================================================

            await page.goto('http://localhost:5173/', {
                waitUntil: 'domcontentloaded'
            });

            await page.waitForLoadState('networkidle');

            // ====================================================
            // LOGIN
            // ====================================================

            console.log('   ↳ Login...');

            const userIcon = page
                .locator('nav .lucide-user, header .lucide-user')
                .first();

            await userIcon.waitFor({
                state: 'visible',
                timeout: 10000
            });

            await userIcon.click();

            await page.waitForTimeout(1000);

            await page.fill('input[name="email"]', user.email);

            await page.fill('input[name="password"]', user.password);

            await page.click('button:has-text("SIGN IN")');

            await page.waitForLoadState('networkidle');

            await page.waitForTimeout(3000);

            // ====================================================
            // RECIPES
            // ====================================================

            console.log('   ↳ Open recipes...');

            await page.goto(
                'http://localhost:5173/all-recipes',
                {
                    waitUntil: 'domcontentloaded'
                }
            );

            await page.waitForLoadState('networkidle');

            await page.waitForTimeout(3000);

            const recipeCards = page.locator(
                '.grid a, .card, [class*="RecipeCard"]'
            );

            const totalRecipes = await recipeCards.count();

            if (totalRecipes === 0) {
                throw new Error('Không tìm thấy recipe.');
            }

            console.log(
                `   📦 Total recipe: ${totalRecipes}. Chọn recipe đầu tiên...`
            );

            const targetRecipe = recipeCards.first();

            await targetRecipe.waitFor({
                state: 'visible',
                timeout: 15000
            });

            await targetRecipe.scrollIntoViewIfNeeded();

            await page.waitForTimeout(1500);

            await targetRecipe.click({
                force: true
            });

            await page.waitForLoadState('networkidle');

            await page.waitForTimeout(3000);

            // ====================================================
            // VEGANIC SECTION
            // ====================================================

            console.log('   ↳ Add Veganic ingredients...');

            const veganicSection = page
                .locator('div, section')
                .filter({
                    hasText: /Available In Veganic/i
                })
                .last();

            await veganicSection.waitFor({
                state: 'visible',
                timeout: 20000
            });

            const addAllBtn = veganicSection
                .locator('button:has-text("ADD ALL TO CART")')
                .first();

            await addAllBtn.waitFor({
                state: 'visible',
                timeout: 15000
            });

            await addAllBtn.scrollIntoViewIfNeeded();

            await expect(addAllBtn).toBeEnabled();

            await page.waitForTimeout(1500);

            await addAllBtn.click({
                force: true
            });

            // ====================================================
            // WAIT CART STABLE
            // ====================================================

            console.log('   ↳ Waiting cart sync...');

            await page.waitForLoadState('networkidle');

            await page.waitForTimeout(5000);

            await page.waitForSelector(
                '.toast,.notification,.snackbar,.swal2-container,.loading,.spinner',
                {
                    state: 'hidden',
                    timeout: 15000
                }
            ).catch(() => {});

            // ====================================================
            // OPEN CART
            // ====================================================

            console.log('   ↳ Open cart...');

            const cartIcon = page
                .locator(
                    'nav .lucide-shopping-bag, header .lucide-shopping-bag'
                )
                .last();

            await cartIcon.waitFor({
                state: 'visible',
                timeout: 15000
            });

            await cartIcon.scrollIntoViewIfNeeded();

            await page.waitForTimeout(1000);

            await cartIcon.click({
                force: true
            });

            await page.waitForLoadState('networkidle');

            await page.waitForTimeout(4000);

            // ====================================================
            // CHECKOUT
            // ====================================================

            console.log('   ↳ Checkout...');

            const checkoutBtn = page.locator(
                'button:has-text("CONTINUE TO CHECKOUT"), a:has-text("CONTINUE TO CHECKOUT"), button:has-text("Checkout")'
            ).first();

            try {

                await checkoutBtn.waitFor({
                    state: 'visible',
                    timeout: 15000
                });

                await checkoutBtn.scrollIntoViewIfNeeded();

                await expect(checkoutBtn).toBeEnabled();

                await page.waitForTimeout(1500);

                await checkoutBtn.click({
                    force: true
                });

            } catch (err) {

                console.log(
                    '   ⚠️ Cannot click checkout => direct goto'
                );

                await page.goto(
                    'http://localhost:5173/checkout'
                );
            }

            await page.waitForLoadState('networkidle');

            await page.waitForTimeout(4000);

            // ====================================================
            // SHIPPING
            // ====================================================

            console.log('   ↳ Shipping info...');

            const shippingSection = page.locator(
                'div:has-text("Shipping Information")'
            );

            const fullNameInput = page.locator(
                'input[name="fullName"]'
            );

            await fullNameInput.waitFor({
                state: 'visible',
                timeout: 20000
            });

            const randomStreet =
                streets[Math.floor(Math.random() * streets.length)];

            const randomAddress =
                `${Math.floor(Math.random() * 250) + 1}, ${randomStreet}`;

            await fullNameInput.fill(
                user.fullName || 'Nguoi Nhan'
            );

            await shippingSection
                .locator('input[name="email"]')
                .fill(user.email);

            await shippingSection
                .locator('input[name="phone"]')
                .fill(user.phone || '0912345678');

            await shippingSection
                .locator('input[name="address"]')
                .fill(randomAddress);

            // ====================================================
            // PROVINCE
            // ====================================================

            console.log('   ↳ Province...');

            const provinceSelect =
                shippingSection.locator(
                    'select[name="provinceId"]'
                );

            await provinceSelect.waitFor({
                state: 'visible',
                timeout: 15000
            });

            await provinceSelect.selectOption('201');

            await page.waitForTimeout(3000);

            // ====================================================
            // DISTRICT
            // ====================================================

            console.log('   ↳ District...');

            const districtSelect =
                shippingSection.locator(
                    'select[name="districtId"]'
                );

            await expect(districtSelect).toBeEnabled({
                timeout: 20000
            });

            await districtSelect.selectOption({
                index: 1
            });

            await page.waitForTimeout(3000);

            // ====================================================
            // WARD
            // ====================================================

            console.log('   ↳ Ward...');

            const wardSelect =
                shippingSection.locator(
                    'select[name="wardCode"]'
                );

            await expect(wardSelect).toBeEnabled({
                timeout: 20000
            });

            await wardSelect.selectOption({
                index: 1
            });

            await page.waitForTimeout(3000);

            // ====================================================
            // CONTINUE
            // ====================================================

            console.log('   ↳ Continue payment...');

            const continueBtns = page.getByRole('button', {
                name: 'Continue'
            });

            await continueBtns.first().click({
                force: true
            });

            await page.waitForTimeout(3000);

            // ====================================================
            // COD
            // ====================================================

            console.log('   ↳ COD payment...');

            const codPaymentOption = page
                .locator('div:has-text("Cash on Delivery (COD)")')
                .last();

            await codPaymentOption.waitFor({
                state: 'visible',
                timeout: 15000
            });

            await codPaymentOption.click({
                force: true
            });

            await page.waitForTimeout(2000);

            // ====================================================
            // REVIEW CONTINUE
            // ====================================================

            await continueBtns.last().click({
                force: true
            });

            await page.waitForTimeout(4000);

            // ====================================================
            // PLACE ORDER
            // ====================================================

            console.log('   ↳ Place order...');

            const placeOrderBtn = page.getByRole('button', {
                name: 'Place Order'
            });

            await placeOrderBtn.waitFor({
                state: 'visible',
                timeout: 15000
            });

            await placeOrderBtn.scrollIntoViewIfNeeded();

            await expect(placeOrderBtn).toBeEnabled();

            await page.waitForTimeout(1500);

            await placeOrderBtn.click({
                force: true
            });

            // ====================================================
            // SUCCESS
            // ====================================================

            await expect(page).toHaveURL(
                /success/,
                {
                    timeout: 60000
                }
            );

            console.log(
                `🎉 SUCCESS: ${user.email}`
            );

        } catch (error) {

            console.error(
                `❌ ERROR USER ${user.realIndex}:`,
                error.message
            );

            await page.screenshot({
                path: `failed_user_${user.realIndex}.png`,
                fullPage: true
            });

        } finally {

            // ====================================================
            // LOGOUT
            // ====================================================

            try {

                console.log('   ↳ Logout...');

                await page.goto(
                    'http://localhost:5173/'
                );

                await page.waitForLoadState('networkidle');

                const logoutBtn = page.locator(
                    'text=Log Out, text=Logout, text=Đăng xuất, button:has-text("Log out")'
                ).first();

                if (await logoutBtn.isVisible()) {

                    await logoutBtn.click({
                        force: true
                    });

                    await page.waitForTimeout(2000);
                }

            } catch (logoutError) {}

            await context.clearCookies();

            await page.close();

            await context.close();

            console.log('   🧹 Cleared session.');
        }
    }

    await browser.close();

    console.log('\n🏁 DONE ALL');
});