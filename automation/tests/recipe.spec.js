const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('Đặt hàng tự động - Chọn công thức Veganic & Thanh toán COD', async () => {

    test.setTimeout(0);

    // ====================================================
    // ĐỌC FILE ACCOUNT
    // ====================================================

    const dataDir = path.join(__dirname, '../data');

    const accountsFile = path.join(
        dataDir,
        'accounts.json'
    );

    if (!fs.existsSync(accountsFile)) {

        console.error(
            '❌ Không tìm thấy file accounts.json!'
        );

        return;
    }

    let accountsList = JSON.parse(
        fs.readFileSync(accountsFile, 'utf8')
    );

    accountsList.reverse();

    // ====================================================
    // RANDOM ĐỊA CHỈ
    // ====================================================

    const streets = [
        'Trần Đại Nghĩa',
        'Lê Duẩn',
        'Nguyễn Văn Linh',
        'Điện Biên Phủ',
        'Hai Bà Trưng',
        'Cách Mạng Tháng Tám',
        'Bùi Viện',
        'Nguyễn Huệ',
        'Phan Chu Trinh',
        'Lý Tự Trọng',
        'Hoàng Diệu',
        'Trần Hưng Đạo'
    ];

    console.log(
        `🚀 Bắt đầu chiến dịch COD với ${accountsList.length} tài khoản...`
    );

    const BATCH_SIZE = 50;

    // ====================================================
    // CHẠY THEO BATCH
    // ====================================================

    for (
        let b = 0;
        b < accountsList.length;
        b += BATCH_SIZE
    ) {

        const batch = accountsList.slice(
            b,
            b + BATCH_SIZE
        );

        const isHeaded =
            process.env.HEADED !== 'false';

        const browser = await chromium.launch({
            headless: !isHeaded,

            // FIX RACE CONDITION REACT + GHN
            slowMo: isHeaded ? 150 : 100
        });

        // ====================================================
        // LOOP USER
        // ====================================================

        for (let i = 0; i < batch.length; i++) {

            const user = batch[i];

            const currentIndex = b + i;

            const realIndex =
                accountsList.length - currentIndex;

            if (realIndex === 499) {

                console.log(
                    `\n⏭️ [🔥 BỎ QUA] USER [499/${accountsList.length}]: ${user.email}`
                );

                continue;
            }

            const context =
                await browser.newContext();

            const page =
                await context.newPage();

            console.log(
                `\n👤 [${realIndex}/${accountsList.length}] USER: ${user.email}`
            );

            try {

                // ====================================================
                // LOGIN
                // ====================================================

                console.log('🔐 Đăng nhập...');

                await page.goto(
                    'http://localhost:5173/'
                );

                await page.waitForLoadState(
                    'networkidle'
                );

                await page.locator(
                    'nav .lucide-user, header .lucide-user'
                )
                    .first()
                    .click();

                await page.fill(
                    'input[name="email"]',
                    user.email
                );

                await page.fill(
                    'input[name="password"]',
                    user.password
                );

                await page.click(
                    'button:has-text("SIGN IN")'
                );

                await page.waitForLoadState(
                    'networkidle'
                );

                // ====================================================
                // RECIPES
                // ====================================================

                console.log(
                    '🍲 Chuyển sang recipes...'
                );

                await page.goto(
                    'http://localhost:5173/all-recipes'
                );

                await page.waitForLoadState(
                    'networkidle'
                );

                const firstRecipe = page.locator(
                    '.grid a, .card, [class*="RecipeCard"]'
                ).first();

                await firstRecipe
                    .scrollIntoViewIfNeeded();

                const currentUrl = page.url();

                console.log(
                    '⚡ Click recipe đầu tiên...'
                );

                await firstRecipe.click();

                try {

                    await page.waitForURL(
                        url =>
                            url.href !== currentUrl,
                        {
                            timeout: 10000
                        }
                    );

                } catch (err) {

                    await page.screenshot({
                        path:
                            `error_user_${realIndex}_click_fail.png`
                    });

                    throw new Error(
                        'React không điều hướng sang trang recipe.'
                    );
                }

                console.log(
                    '⏳ Đợi API recipe load...'
                );

                await page.waitForLoadState(
                    'networkidle'
                );

                // ====================================================
                // VEGANIC
                // ====================================================

                console.log(
                    '🌱 Tìm Veganic section...'
                );

                const veganicSection =
                    page.locator(
                        'div, section'
                    ).filter({
                        hasText:
                            /Available In Veganic/i
                    }).last();

                const addAllBtn =
                    veganicSection.locator(
                        'button:has-text("ADD ALL TO CART")'
                    ).first();

                try {

                    await addAllBtn.waitFor({
                        state: 'visible',
                        timeout: 8000
                    });

                } catch (err) {

                    await page.screenshot({
                        path:
                            `error_user_${realIndex}_detail_crash.png`
                    });

                    throw new Error(
                        'Không thấy nút ADD ALL TO CART'
                    );
                }

                await addAllBtn
                    .scrollIntoViewIfNeeded();

                await addAllBtn.click();

                console.log(
                    '✅ Đã thêm nguyên liệu vào giỏ'
                );

                // ====================================================
                // CART
                // ====================================================

                console.log(
                    '🛍️ Mở giỏ hàng...'
                );

                await page.locator(
                    'nav .lucide-shopping-bag, header .lucide-shopping-bag'
                )
                    .last()
                    .click();

                await page.waitForLoadState(
                    'networkidle'
                );

                console.log(
                    '➡️ Sang checkout...'
                );

                await page.getByRole(
                    'button',
                    {
                        name:
                            /CONTINUE TO CHECKOUT/i
                    }
                ).click();

                await page.waitForLoadState(
                    'networkidle'
                );

                // ====================================================
                // CHECKOUT
                // ====================================================

                console.log(
                    '📝 Kiểm tra checkout...'
                );

                const fullNameInput =
                    page.locator(
                        'input[name="fullName"]'
                    );

                try {

                    await fullNameInput.waitFor({
                        state: 'visible',
                        timeout: 8000
                    });

                } catch (err) {

                    await page.screenshot({
                        path:
                            `error_user_${realIndex}_checkout_crash.png`
                    });

                    throw new Error(
                        'Checkout bị crash'
                    );
                }

                const randomStreet =
                    streets[
                        Math.floor(
                            Math.random() *
                            streets.length
                        )
                    ];

                const randomAddress =
                    `${Math.floor(Math.random() * 250) + 1}, Đường ${randomStreet}`;

                // ====================================================
                // SHIPPING INFO
                // ====================================================

                console.log(
                    '📦 Điền shipping info...'
                );

                const shippingSection = page.locator(
                    'div:has-text("Shipping Information")'
                );

                await fullNameInput.fill(
                    user.fullName
                );

                await shippingSection
                    .locator('input[name="email"]')
                    .fill(user.email);

                await shippingSection
                    .locator('input[name="phone"]')
                    .fill(
                        user.phone ||
                        '0912345678'
                    );

                await shippingSection
                    .locator('input[name="address"]')
                    .fill(randomAddress);

                // ====================================================
                // PROVINCE
                // ====================================================

                console.log(
                    '📍 Chọn Province...'
                );

                const provinceSelect =
                    shippingSection.locator(
                        'select[name="provinceId"]'
                    );

                await provinceSelect.selectOption(
                    '201'
                );

                await expect(
                    provinceSelect
                ).toHaveValue('201');

                // ====================================================
                // DISTRICT
                // ====================================================

                console.log(
                    '⏳ Đợi District load...'
                );

                const districtSelect =
                    shippingSection.locator(
                        'select[name="districtId"]'
                    );

                await expect(
                    districtSelect
                ).toBeEnabled({
                    timeout: 15000
                });

                await expect(async () => {

                    const count =
                        await districtSelect
                            .locator('option')
                            .count();

                    if (count <= 1) {

                        throw new Error(
                            'District chưa load'
                        );
                    }

                }).toPass({
                    timeout: 15000
                });

                await districtSelect.selectOption({
                    index: 1
                });

                // FIX REACT STATE
                await expect(
                    districtSelect
                ).not.toHaveValue('');

                const districtValue =
                    await districtSelect.inputValue();

                console.log(
                    `✅ District selected: ${districtValue}`
                );

                // ====================================================
                // WARD
                // ====================================================

                console.log(
                    '⏳ Đợi Ward load...'
                );

                const wardSelect =
                    shippingSection.locator(
                        'select[name="wardCode"]'
                    );

                await expect(
                    wardSelect
                ).toBeEnabled({
                    timeout: 15000
                });

                await expect(async () => {

                    const count =
                        await wardSelect
                            .locator('option')
                            .count();

                    if (count <= 1) {

                        throw new Error(
                            'Ward chưa load'
                        );
                    }

                }).toPass({
                    timeout: 15000
                });

                await wardSelect.selectOption({
                    index: 1
                });

                // FIX REACT STATE
                await expect(
                    wardSelect
                ).not.toHaveValue('');

                const wardValue =
                    await wardSelect.inputValue();

                console.log(
                    `✅ Ward selected: ${wardValue}`
                );

                // ====================================================
                // GHN SHIPPING
                // ====================================================

                console.log(
                    '🚚 Đợi GHN tính shipping fee...'
                );

                try {

                    await page.waitForResponse(
                        response => {

                            return (
                                response.url().includes('shipping') &&
                                response.status() === 200
                            );
                        },
                        {
                            timeout: 20000
                        }
                    );

                    console.log(
                        '✅ GHN shipping loaded'
                    );

                } catch (err) {

                    console.log(
                        '⚠️ Không bắt được request shipping nhưng vẫn tiếp tục...'
                    );
                }

                await page.waitForLoadState(
                    'networkidle'
                );

                // ====================================================
                // CONTINUE SHIPPING
                // ====================================================

                await page.getByRole(
                    'button',
                    {
                        name: 'Continue'
                    }
                ).click();

                await page.waitForLoadState(
                    'networkidle'
                );

                // ====================================================
                // PAYMENT
                // ====================================================

                console.log(
                    '💳 Chọn COD...'
                );

                await page.waitForSelector(
                    'text=Payment Method'
                );

                const codPaymentOption =
                    page.locator(
                        'div:has-text("Cash on Delivery (COD)")'
                    ).last();

                await codPaymentOption.click();

                console.log(
                    '✅ Đã chọn COD'
                );

                // ====================================================
                // CONTINUE PAYMENT
                // ====================================================

                await page.getByRole(
                    'button',
                    {
                        name: 'Continue'
                    }
                ).click();

                await page.waitForLoadState(
                    'networkidle'
                );

                // ====================================================
                // PLACE ORDER
                // ====================================================

                console.log(
                    '🧾 Xác nhận đơn hàng...'
                );

                await page.waitForSelector(
                    'text=Confirm Order'
                );

                const placeOrderBtn =
                    page.getByRole(
                        'button',
                        {
                            name:
                                'Place Order'
                        }
                    );

                await expect(
                    placeOrderBtn
                ).toBeVisible();

                await placeOrderBtn.click();

                console.log(
                    '⏳ Đợi success page...'
                );

                await expect(page)
                    .toHaveURL(
                        /success/,
                        {
                            timeout: 45000
                        }
                    );

                console.log(
                    `🎉 COD SUCCESS: ${user.email}`
                );

            } catch (error) {

                console.error(
                    `❌ FAIL USER ${user.email}:`,
                    error.message
                );

                await page.screenshot({
                    path:
                        `failed_user_${realIndex}.png`,
                    fullPage: true
                });

            } finally {

                await page.close();

                await context.close();
            }
        }

        await browser.close();

        console.log(
            '\n♻️ Đã cleanup browser batch'
        );
    }

    console.log(
        '\n🏁 CHIẾN DỊCH COD HOÀN THÀNH!'
    );

});