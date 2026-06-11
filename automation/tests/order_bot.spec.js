const { test } = require("@playwright/test");
const { faker } = require("@faker-js/faker");
const fs = require("fs");
const path = require("path");

// =============================================================
// 1. BỘ QUY TẮC COMBO MỞ RỘNG (Dữ liệu vàng cho Recommendation)
// =============================================================
const expandedRules = {
  // --- NHÓM PACKAGES (NƯỚC ÉP - GIẢI KHÁT & BỮA SÁNG) ---
  "Bravo-Orange-Juice": ["Sausage", "Bacon", "Banana", "Ham", "Arla-Standard-Milk"],
  "Bravo-Apple-Juice": ["Royal-Gala", "Turkey", "Galia-Melon", "Arla-Lactose-Medium-Fat-Milk"],
  "God-Morgon-Orange-Juice": ["Sausage", "Bacon", "Arla-Ecological-Medium-Fat-Milk", "Egg-Tomato"],
  "God-Morgon-Apple-Juice": ["Conference", "Kaiser", "Turkey", "Garant-Ecological-Standard-Milk"],
  "God-Morgon-Red-Grapefruit-Juice": ["Red-Grapefruit", "Nectarine", "Satsumas", "Avocado"],
  "Tropicana-Apple-Juice": ["Pink-Lady", "Red-Delicious", "Royal-Gala", "Cantaloupe"],
  "Tropicana-Juice-Smooth": ["Shrimp", "Mango", "Passion-Fruit", "Lime"],
  "Tropicana-Golden-Grapefruit": ["Red-Grapefruit", "Salmon", "Avocado", "Lime"],
  "Tropicana-Mandarin-Morning": ["Satsumas", "Orange", "Banana", "Arla-Natural-Yoghurt"],
  "God-Morgon-Orange-Red-Grapefruit-Juice": ["Duck", "Orange", "Red-Bell-Pepper", "Mango"],

  // --- NHÓM PACKAGES (SỮA NƯỚC - DAIRY) ---
  "Arla-Standard-Milk": ["Bacon", "Sausage", "Royal-Gala", "Golden-Delicious", "Banana"],
  "Arla-Medium-Fat-Milk": ["Pork", "Sweet-Potato", "Granny-Smith", "Pink-Lady"],
  "Arla-Lactose-Medium-Fat-Milk": ["Oatly-Oat-Milk", "Banana", "Kiwi", "Blueberry-Soyghurt"],
  "Arla-Ecological-Medium-Fat-Milk": ["Lamb", "Asparagus", "Conference", "Kaiser"],
  "Garant-Ecological-Standard-Milk": ["Bacon", "Sausage", "Red-Delicious", "Pink-Lady"],
  "Oatly-Oat-Milk": ["Avocado", "Banana", "Granny-Smith", "Kiwi", "Alpro-Blueberry-Soyghurt"],
  "Alpro-Shelf-Soy-Milk": ["Avocado", "Mango", "Alpro-Vanilla-Soyghurt", "Passion-Fruit"],
  "Alpro-Fresh-Soy-Milk": ["Kiwi", "Mango", "Oatly-Natural-Oatghurt", "Lime"],
  "Oatly-Natural-Oat-Drink": ["Banana", "Pink-Lady", "Kiwi", "Granola"],

  // --- NHÓM PACKAGES (SỮA CHUA - YOGHURT & SOUR MILK) ---
  "Yoggi-Strawberry-Yoghurt": ["Pink-Lady", "Kiwi", "Passion-Fruit", "Avocado", "Red Cherry"],
  "Yoggi-Vanilla-Yoghurt": ["Banana", "Plum", "Nectarine", "Bravo-Apple-Juice"],
  "Arla-Natural-Yoghurt": ["Pink-Lady", "Mango", "Passion-Fruit", "Banana"],
  "Valio-Vanilla-Yoghurt": ["Red Cherry", "Pink-Lady", "Passion-Fruit", "Kaiser"],
  "Arla-Mild-Vanilla-Yoghurt": ["Banana", "Kiwi", "Royal-Gala", "Alpro-Blueberry-Soyghurt"],
  "Arla-Natural-Mild-Low-Fat-Yoghurt": ["Granny-Smith", "Avocado", "Oatly-Natural-Oatghurt"],
  "Alpro-Blueberry-Soyghurt": ["Oatly-Oat-Milk", "Kiwi", "Banana", "Pink-Lady"],
  "Alpro-Vanilla-Soyghurt": ["Mango", "Pineapple", "Passion-Fruit", "Alpro-Fresh-Soy-Milk"],
  "Oatly-Natural-Oatghurt": ["Avocado", "Alpro-Fresh-Soy-Milk", "Pink-Lady", "Kiwi"],
  "Arla-Sour-Cream": ["Salmon", "Solid-Potato", "Cucumber", "Regular-Tomato"],
  "Arla-Ecological-Sour-Cream": ["Asparagus", "Salmon", "Tuna", "Shrimp"],

  // --- NHÓM TRÁI CÂY (FRUITS - KÉO THEO SỮA/NƯỚC ÉP) ---
  "Avocado": ["Lime", "Salmon", "Alpro-Fresh-Soy-Milk", "Oatly-Oat-Milk", "Kiwi"],
  "Banana": ["Oatly-Oat-Milk", "Sweet-Potato", "Yoggi-Vanilla-Yoghurt", "Bravo-Orange-Juice"],
  "Pink-Lady": ["Arla-Natural-Yoghurt", "Kiwi", "Oatly-Natural-Oatghurt", "Banana"],
  "Kiwi": ["Yoggi-Strawberry-Yoghurt", "Pink-Lady", "Alpro-Blueberry-Soyghurt", "Passion-Fruit"],
  "Mango": ["Passion-Fruit", "Lime", "Alpro-Vanilla-Soyghurt", "Galia-Melon"],
  "Passion-Fruit": ["Mango", "Valio-Vanilla-Yoghurt", "Orange", "Tropicana-Juice-Smooth"],
  "Lime": ["Salmon", "Shrimp", "Avocado", "Watermelon", "Ginger"]
};

test("Veggies Mart: Bulk Orders with 2-3 Proteins & Anti-Drift Logic", async ({ browser }) => {
  test.setTimeout(0);

  const dataDir = path.join(__dirname, "../data");
  const accountsFile = path.join(dataDir, "accounts.json");
  const ordersFile = path.join(dataDir, "bulk_orders_results.json");

  if (!fs.existsSync(accountsFile)) return console.error("❌ Thiếu file accounts.json");

  const allAccounts = JSON.parse(fs.readFileSync(accountsFile, "utf-8"));
  const testAccounts = allAccounts.slice(360, 500);

  const catalog = {
    protein: ["Sausage","Beef", "Pork", "Lamb", "Chicken", "Duck", "Goat", "Salmon", "Tuna", "Sardine", "Shrimp", "Crab", "Tilapia", "Cod", "Bacon", "Turkey", "Ham", "Anchovy", "Mackerel"],
    veggies: ["Aubergine", "Cucumber", "Asparagus", "Red-Beet", "Sweet-Potato", "Ginger", "Brown-Cap-Mushroom", "Yellow-Bell-Pepper", "Vine-Tomato", "Garlic", "Red-Bell-Pepper", "Yellow-Onion", "Green-Bell-Pepper", "Orange-Bell-Pepper", "Regular-Tomato", "Floury-Potato", "Solid-Potato", "Beef-Tomato"],
    fruits: ["Orange","Plum", "Avocado", "Lime", "Kiwi", "Orange", "Pomegranate", "Granny-Smith", "Lemon", "Watermelon", "Plum", "Golden-Delicious", "Galia-Melon", "Red-Grapefruit", "Honeydew-Melon", "Nectarine", "Conference", "Kaiser", "Satsumas", "Red-Delicious", "Royal-Gala", "Cantaloupe", "Papaya", "Passion-Fruit", "Green Apple", "Red Cherry", "Pink-Lady"],
    packages: ["Bravo-Orange-Juice", "God-Morgon-Orange-Juice", "Tropicana-Golden-Grapefruit", "Tropicana-Mandarin-Morning", "Arla-Lactose-Medium-Fat-Milk", "Garant-Ecological-Standard-Milk", "Oatly-Oat-Milk", "Arla-Ecological-Sour-Cream", "Alpro-Shelf-Soy-Milk", "Arla-Natural-Mild-Low-Fat-Yoghurt", "Yoggi-Strawberry-Yoghurt", "God-Morgon-Red-Grapefruit-Juice", "Tropicana-Apple-Juice", "Arla-Medium-Fat-Milk", "Yoggi-Vanilla-Yoghurt", "Arla-Standard-Milk", "Arla-Sour-Cream", "Arla-Sour-Milk", "Alpro-Vanilla-Soyghurt", "Arla-Mild-Vanilla-Yoghurt", "Bravo-Apple-Juice", "God-Morgon-Apple-Juice", "God-Morgon-Orange-Red-Grapefruit-Juice", "Tropicana-Juice-Smooth", "Arla-Ecological-Medium-Fat-Milk", "Garant-Ecological-Medium-Fat-Milk", "Oatly-Natural-Oatghurt", "Alpro-Fresh-Soy-Milk", "Alpro-Blueberry-Soyghurt", "Arla-Natural-Yoghurt", "Valio-Vanilla-Yoghurt"],
  };

  const dnDistricts = [
    { district: "Hai Chau", streets: ["Bach Dang", "Tran Phu", "Le Duan", "Nguyen Van Linh"] },
    { district: "Thanh Khe", streets: ["Nguyen Tat Thanh", "Dien Bien Phu", "Ha Huy Tap"] },
    { district: "Son Tra", streets: ["Vo Nguyen Giap", "Ho Nghinh", "Pham Van Dong"] }
  ];

  for (const user of testAccounts) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      console.log(`\n👤 USER: ${user.email}`);
      await page.goto("http://localhost:5173/");
      await page.waitForLoadState("networkidle");

      // --- LOGIN ---
      await page.locator("nav .lucide-user, header .lucide-user").first().click();
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.click('button:has-text("SIGN IN")');
      await page.waitForTimeout(2000);

      for (let i = 1; i <= 2; i++) {
        console.log(`  📦 Đơn hàng [${i}/2]...`);

        // --- HÀM TẠO COMBO (2-3 Protein + Mồi) ---
        const generateSmartCombo = () => {
          // Bốc ngẫu nhiên 2 đến 3 loại Protein
          const packagesCount = faker.number.int({ min: 2, max: 3 });
          const chosenProteins = faker.helpers.arrayElements(catalog.packages, packagesCount);
          
          let relatedItems = [];
          chosenProteins.forEach(p => {
            if (expandedRules[p]) {
              // Lấy thêm 1-2 món rau đi kèm mỗi loại protein
              relatedItems.push(...faker.helpers.arrayElements(expandedRules[p], { min: 1, max: 2 }));
            }
          });

          // Chọn 1 món rau làm "mồi" đầu tiên để chống trôi
          const starter = faker.helpers.arrayElement(catalog.veggies);
          
          // Layout: [Món mồi, Protein 1, Protein 2, (Protein 3), các món rau liên quan]
          const fullList = [starter, ...chosenProteins, ...relatedItems];
          return [...new Set(fullList)].filter(Boolean);
        };

        const myCombo = generateSmartCombo();
        
        await page.locator(".lucide-menu").first().click();
        await page.locator("text=Products").first().click();
        await page.waitForLoadState("networkidle");

        const searchInput = page.getByPlaceholder("Search...");
        
        for (const [index, item] of myCombo.entries()) {
          // CHỐNG TRÔI: Click và clear trước khi gõ
          await searchInput.click();
          await searchInput.clear(); 
          
          // Món đầu tiên cho đợi lâu hơn chút để UI ổn định
          await page.waitForTimeout(index === 0 ? 800 : 300);
          
          await searchInput.fill(item);
          await page.waitForTimeout(1100); // Đợi kết quả Search hiện ra

          const addBtn = page.locator('main button:has(.lucide-plus), div[class*="grid"] button:has(.lucide-plus)').first();
          
          if (await addBtn.isVisible()) {
            await addBtn.click({ force: true });
            console.log(`    ➕ Đã add [${index === 0 ? 'Starter' : 'Item'}]: ${item}`);
            await page.waitForTimeout(700);
          } else {
            console.log(`    ⚠️ Không tìm thấy: ${item}`);
          }
          await searchInput.fill("");
        }

        // --- CHECKOUT ---
        await page.locator("nav .lucide-shopping-bag, header .lucide-shopping-bag").last().click();
        await page.waitForTimeout(1000);
        await page.getByRole("button", { name: /CONTINUE TO CHECKOUT/i }).click();

        await page.fill('input[name="fullName"]', user.fullName);
        await page.fill('input[name="phone"]', `09${faker.string.numeric(8)}`);
        const location = faker.helpers.arrayElement(dnDistricts);
        await page.fill('input[name="address"]', `${faker.number.int({ min: 1, max: 999 })} ${faker.helpers.arrayElement(location.streets)} St`);
        await page.fill('input[name="city"]', "Da Nang");
        await page.fill('input[name="country"]', "Viet Nam");
        await page.click('button:has-text("VERIFY & CONTINUE")');

        await page.locator('div:has-text("Credit Card / Stripe")').last().click();
        await page.click('button:has-text("PAY NOW WITH STRIPE")');

        await page.waitForURL(/checkout.stripe.com/);
        await page.locator("#cardNumber").fill("4242424242424242");
        await page.locator("#cardExpiry").fill("12/28");
        await page.locator("#cardCvc").fill("123");
        await page.locator("#billingName").fill(user.fullName);
        await page.click('button[type="submit"]');

        await page.waitForURL("**/success**", { timeout: 40000 });
        console.log(`  ✅ Xong đơn ${i}`);

        fs.appendFileSync(ordersFile, JSON.stringify({ email: user.email, items: myCombo, date: new Date() }) + "\n");
        if (i < 2) await page.goto("http://localhost:5173/");
      }
    } catch (err) {
      console.error(`❌ Lỗi:`, err.message);
      await page.screenshot({ path: `logs/err-${user.email.split("@")[0]}.png` });
    } finally {
      await context.close();
    }
  }
});