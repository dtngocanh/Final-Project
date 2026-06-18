const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('Dat hang tu dong - Stable Checkout Flow', async () => {
    test.setTimeout(0);

    const dataDir = path.join(__dirname, '../data');
    const accountsFile = path.join(dataDir, 'accounts2.json');

    if (!fs.existsSync(accountsFile)) {
        console.error('Khong tim thay file accounts.json!');
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

    // Chạy dải account từ 400 đến 450
    const accountsList = accountsWithIndex.filter(
    user => user.realIndex >= 300 && user.realIndex <= 400
);

    const streets = [
        'Tran Dai Nghia', 'Le Duan', 'Nguyen Van Linh', 'Dien Bien Phu',
        'Hai Ba Trung', 'Cach Mang Thang Tam', 'Bui Vien', 'Nguyen Hue',
        'Phan Chu Trinh', 'Ly Tu Trong', 'Hoang Dieu', 'Tran Hung Dao'
    ];

    console.log(`🚀 Start automation campaign [400 -> 450]`);
    console.log(`📦 Total accounts to process: ${accountsList.length}`);

    const isHeaded = process.env.HEADED !== 'false';

    const browser = await chromium.launch({
        headless: !isHeaded,
        slowMo: isHeaded ? 200 : 50
    });

    for (const user of accountsList) {

        if (user.realIndex === 499) {
            console.log(`[BO QUA] USER ${user.realIndex}`);
            continue;
        }

        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });

        const page = await context.newPage();

        console.log(`\n👉 [${user.realIndex}/${totalOriginal}] ${user.email}`);

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
            const userIcon = page.locator('nav .lucide-user, header .lucide-user').first();
            await userIcon.waitFor({ state: 'visible', timeout: 10000 });
            await userIcon.click();
            await page.waitForTimeout(1000);

            await page.fill('input[name="email"]', user.email);
            await page.fill('input[name="password"]', user.password);
            await page.click('button:has-text("SIGN IN")');
            
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2500); // Cho React sync xong login state

            // ====================================================
            // RECIPES
            // ====================================================
            console.log('   ↳ Open recipes...');
            await page.goto('http://localhost:5173/all-recipes', {
                waitUntil: 'domcontentloaded'
            });
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            const recipeCards = page.locator('.grid a, .card, [class*="RecipeCard"]');
            const totalRecipes = await recipeCards.count();

            if (totalRecipes === 0) {
                throw new Error('Khong tim thay bat ky recipe nao tren UI.');
            }

            console.log(`   📦 Total recipe: ${totalRecipes}. Chon recipe dau tien...`);
            const targetRecipe = recipeCards.first();
            await targetRecipe.waitFor({ state: 'visible', timeout: 15000 });
            await targetRecipe.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            await targetRecipe.click({ force: true });

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2500);

            // ====================================================
            // Veggies SECTION
            // ====================================================
            console.log('   ↳ Add Veggies ingredients...');
            const VeggiesSection = page.locator('div, section').filter({
                hasText: /Available In Veggies/i
            }).last();

            await VeggiesSection.waitFor({ state: 'visible', timeout: 20000 });
            const addAllBtn = VeggiesSection.locator('button:has-text("ADD ALL TO CART")').first();
            
            await addAllBtn.waitFor({ state: 'visible', timeout: 15000 });
            await addAllBtn.scrollIntoViewIfNeeded();
            await expect(addAllBtn).toBeEnabled();
            await page.waitForTimeout(1000);
            await addAllBtn.click({ force: true });

            // ====================================================
            // WAIT CART STABLE
            // ====================================================
            console.log('   ↳ Waiting cart sync...');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(4000);

            // Chờ biến mất các hiệu ứng loading/toast nếu có
            await page.waitForSelector('.toast,.notification,.snackbar,.swal2-container,.loading,.spinner', {
                state: 'hidden',
                timeout: 10000
            }).catch(() => {});

            // ====================================================
            // OPEN CART
            // ====================================================
            console.log('   ↳ Open cart...');
            const cartIcon = page.locator('nav .lucide-shopping-bag, header .lucide-shopping-bag').last();
            await cartIcon.waitFor({ state: 'visible', timeout: 15000 });
            await cartIcon.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            await cartIcon.click({ force: true });

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);

            // ====================================================
            // CHECKOUT
            // ====================================================
            console.log('   ↳ Checkout...');
            const checkoutBtn = page.locator(
                'button:has-text("CONTINUE TO CHECKOUT"), a:has-text("CONTINUE TO CHECKOUT"), button:has-text("Checkout")'
            ).first();

            try {
                await checkoutBtn.waitFor({ state: 'visible', timeout: 10000 });
                await checkoutBtn.scrollIntoViewIfNeeded();
                await expect(checkoutBtn).toBeEnabled();
                await page.waitForTimeout(1000);
                await checkoutBtn.click({ force: true });
            } catch (err) {
                console.log('   ⚠️ Click checkout loi hoac timeout => Điều hướng thẳng sang URL checkout');
                await page.goto('http://localhost:5173/checkout');
            }

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);

            // ====================================================
            // SHIPPING
            // ====================================================
            console.log('   ↳ Shipping info...');
            const shippingSection = page.locator('div:has-text("Shipping Information")');
            const fullNameInput = page.locator('input[name="fullName"]');

            await fullNameInput.waitFor({ state: 'visible', timeout: 15000 });

            const randomStreet = streets[Math.floor(Math.random() * streets.length)];
            const randomAddress = `${Math.floor(Math.random() * 250) + 1}, ${randomStreet}`;

            await fullNameInput.fill(user.fullName || 'Nguoi Nhan');
            await shippingSection.locator('input[name="email"]').fill(user.email);
            await shippingSection.locator('input[name="phone"]').fill(user.phone || '0912345678');
            await shippingSection.locator('input[name="address"]').fill(randomAddress);

            // ====================================================
            // PROVINCE / DISTRICT / WARD
            // ====================================================
            console.log('   ↳ Province...');
            const provinceSelect = shippingSection.locator('select[name="provinceId"]');
            await provinceSelect.waitFor({ state: 'visible', timeout: 10000 });
            await provinceSelect.selectOption('201'); 
            await page.waitForTimeout(2000);

            console.log('   ↳ District...');
            const districtSelect = shippingSection.locator('select[name="districtId"]');
            await expect(districtSelect).toBeEnabled({ timeout: 15000 });
            await districtSelect.selectOption({ index: 1 });
            await page.waitForTimeout(2000);

            console.log('   ↳ Ward...');
            const wardSelect = shippingSection.locator('select[name="wardCode"]');
            await expect(wardSelect).toBeEnabled({ timeout: 15000 });
            await wardSelect.selectOption({ index: 1 });
            await page.waitForTimeout(2000);

            // ====================================================
            // CONTINUE (To Payment Method)
            // ====================================================
            console.log('   ↳ Continue payment step...');
            const continueBtns = page.getByRole('button', { name: 'Continue' });
            await continueBtns.first().click({ force: true });
            await page.waitForTimeout(2500);

            // ====================================================
            // COD SELECTION
            // ====================================================
            console.log('   ↳ COD payment...');
            const codPaymentOption = page.locator('div:has-text("Cash on Delivery (COD)")').last();
            await codPaymentOption.waitFor({ state: 'visible', timeout: 10000 });
            await codPaymentOption.click({ force: true });
            await page.waitForTimeout(1500);

            // Xác nhận qua bước tiếp theo
            await continueBtns.last().click({ force: true });
            await page.waitForTimeout(3000);

            // ====================================================
            // PLACE ORDER & REDIRECT WATCH
            // ====================================================
            console.log('   ↳ Place order...');
            const placeOrderBtn = page.getByRole('button', { name: 'Place Order' });
            
            await placeOrderBtn.waitFor({ state: 'visible', timeout: 10000 });
            await placeOrderBtn.scrollIntoViewIfNeeded();
            await expect(placeOrderBtn).toBeEnabled();
            await page.waitForTimeout(1500);

            // Khắc phục triệt để lỗi treo đứng tại /checkout
            try {
                await Promise.all([
                    page.waitForURL('**/success**', { timeout: 45000 }), 
                    placeOrderBtn.click() // Click tự nhiên, không ép force để React chạy mượt
                ]);
            } catch (redirErr) {
                console.log('   ⚠️ Redirect tu dong bi cham, doi them fallback check...');
                await expect(page).toHaveURL(/success/, { timeout: 15000 });
            }

            console.log(`🎉 SUCCESS: ${user.email} da tao don thanh cong!`);

        } catch (error) {
            console.error(`❌ ERROR USER ${user.realIndex}:`, error.message);
            // Chụp ảnh bằng chứng lỗi để bồ dễ debug giao diện lúc đó
            await page.screenshot({
                path: `failed_user_${user.realIndex}.png`,
                fullPage: true
            });
        } finally {
            // ====================================================
            // CLEAN SESSION & LOGOUT
            // ====================================================
            try {
                console.log('   ↳ Cleaning session...');
                await page.goto('http://localhost:5173/');
                await page.waitForLoadState('networkidle').catch(() => {});

                const logoutBtn = page.locator(
                    'text=Log Out, text=Logout, text=Đang xuất, button:has-text("Log out")'
                ).first();

                if (await logoutBtn.isVisible()) {
                    await logoutBtn.click({ force: true });
                    await page.waitForTimeout(1500);
                }
            } catch (logoutError) {}

            await context.clearCookies();
            await page.close();
            await context.close();
            console.log('   🧹 Cleared session data.');
        }
    }

    await browser.close();
    console.log('\n🏁 DONE ALL CAMPAIGN');
});