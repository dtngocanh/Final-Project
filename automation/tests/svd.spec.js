const { test } = require("@playwright/test");
const { faker } = require("@faker-js/faker");
const fs = require("fs");
const path = require("path");

const catalog = {
  protein: ["Beef", "Pork", "Lamb", "Chicken", "Duck", "Goat", "Salmon", "Tuna", "Sardine", "Shrimp", "Crab", "Tilapia", "Cod", "Bacon", "Turkey", "Ham", "Sausage", "Anchovy", "Mackerel", "Lobster"],
  veggies: ["Aubergine", "Cucumber", "Asparagus", "Red-Beet", "Sweet-Potato", "Ginger", "Brown-Cap-Mushroom", "Yellow-Bell-Pepper", "Vine-Tomato", "Garlic", "Red-Bell-Pepper", "Yellow-Onion", "Green-Bell-Pepper", "Orange-Bell-Pepper", "Regular-Tomato", "Floury-Potato", "Solid-Potato", "Beef-Tomato", "Cabbage", "Leek", "Zucchini", "Purple cabbage", "Fresh Rosemary", "Garden Mint", "Carrots"],
  fruits: ["Orange", "Plum", "Avocado", "Lime", "Kiwi", "Pomegranate", "Granny-Smith", "Lemon", "Watermelon", "Golden-Delicious", "Galia-Melon", "Red-Grapefruit", "Honeydew-Melon", "Nectarine", "Conference", "Kaiser", "Satsumas", "Red-Delicious", "Royal-Gala", "Cantaloupe", "Papaya", "Passion-Fruit", "Peach", "Anjou", "Pineapple", "Pink-Lady"],
  dairy_juice: ["Bravo-Orange-Juice", "God-Morgon-Orange-Juice", "Tropicana-Golden-Grapefruit", "Tropicana-Mandarin-Morning", "Arla-Lactose-Medium-Fat-Milk", "Garant-Ecological-Standard-Milk", "Oatly-Oat-Milk", "Arla-Ecological-Sour-Cream", "Alpro-Shelf-Soy-Milk", "Arla-Natural-Mild-Low-Fat-Yoghurt", "Yoggi-Strawberry-Yoghurt", "God-Morgon-Red-Grapefruit-Juice", "Tropicana-Apple-Juice", "Arla-Medium-Fat-Milk", "Yoggi-Vanilla-Yoghurt", "Arla-Standard-Milk", "Arla-Sour-Cream", "Arla-Sour-Milk", "Alpro-Vanilla-Soyghurt", "Arla-Mild-Vanilla-Yoghurt", "Bravo-Apple-Juice", "God-Morgon-Apple-Juice", "God-Morgon-Orange-Red-Grapefruit-Juice", "Tropicana-Juice-Smooth", "Arla-Ecological-Medium-Fat-Milk", "Garant-Ecological-Medium-Fat-Milk", "Oatly-Natural-Oatghurt", "Alpro-Fresh-Soy-Milk", "Alpro-Blueberry-Soyghurt", "Arla-Natural-Yoghurt", "Valio-Vanilla-Yoghurt"]
};

test("SVD Data Booster: Deep Browsing & Targeted Cart", async ({ browser }) => {
  test.setTimeout(0);

  const dataDir = path.join(__dirname, "../data");
  const accountsFile = path.join(dataDir, "accounts.json");
  const allAccounts = JSON.parse(fs.readFileSync(accountsFile, "utf-8"));
  const testAccounts = allAccounts.slice(187, 500);

  for (const acc of testAccounts) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      console.log(`\n👤 USER: ${acc.email}`);
      
      // 1. ĐĂNG NHẬP
      await page.goto("http://localhost:5173/");
      await page.locator("nav .lucide-user, header .lucide-user").first().click();
      await page.fill('input[name="email"]', acc.email);
      await page.fill('input[name="password"]', acc.password);
      await page.click('button:has-text("SIGN IN")');
      
      // Chờ database xử lý đăng nhập và chuyển trang
      await page.waitForLoadState('networkidle');

      // 2. CHỌN SỞ THÍCH & VIEW DETAIL (10-12 sp)
      const categoryKeys = Object.keys(catalog);
      const myInterest = faker.helpers.arrayElements(categoryKeys, { min: 1, max: 2 });
      const itemPool = myInterest.flatMap(key => catalog[key]);
      const itemsToView = faker.helpers.arrayElements(itemPool, { min: 10, max: 12 });

      console.log(`  🔎 Sở thích: [${myInterest.join(", ")}]`);

      for (const itemName of itemsToView) {
        await page.goto("http://localhost:5173/products");
        const searchInput = page.getByPlaceholder("Search...");
        
        await searchInput.clear();
        // Gõ chậm để trigger search API/Database load
        await searchInput.pressSequentially(itemName, { delay: 50 }); 
        
        // CHỜ QUAN TRỌNG: Đợi database trả kết quả và UI render
        await page.waitForTimeout(1500); 

        const productCard = page.locator(`text=${itemName}`).first();
        
        // Đảm bảo card xuất hiện trước khi click
        if (await productCard.isVisible()) {
          await productCard.click();
          
          // Đợi trang Detail load hoàn toàn
          await page.waitForLoadState('networkidle');
          console.log(`    👀 View Detail: ${itemName}`);
          
          // Giả lập đọc thông tin sp (quan trọng cho AI)
          await page.waitForTimeout(2000); 
        }
      }

      // 3. THÊM GIỎ HÀNG (3-5 sp từ danh sách vừa xem)
      const itemsToCart = faker.helpers.arrayElements(itemsToView, { min: 3, max: 5 });
      console.log(`  🛒 Carting ${itemsToCart.length} sp...`);

      for (const cartItem of itemsToCart) {
        await page.goto("http://localhost:5173/products");
        const searchInput = page.getByPlaceholder("Search...");
        
        await searchInput.clear();
        await searchInput.pressSequentially(cartItem, { delay: 30 });
        
        // Chờ DB trả kết quả search
        await page.waitForTimeout(1200);

        const addBtn = page.locator('button:has(.lucide-plus)').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
          console.log(`    ➕ Added: ${cartItem}`);
          // Chờ animation "Added" hoặc API cart hoàn thành
          await page.waitForTimeout(800); 
        }
      }

      console.log(`  ✨ Xong user ${acc.email}`);

    } catch (err) {
      console.error(`  ❌ Lỗi tại user ${acc.email}:`, err.message);
    } finally {
      await context.close();
    }
  }
});