import Product from "../models/Product.js";

export const createStripeLineItems = async ({
  orderItems,
  shippingResult,
}) => {
  const line_items = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    // PRODUCT NOT FOUND
    if (!product) {
      throw new Error(`${item.name} not found`);
    }

    // INVALID QUANTITY
    if (item.quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    // OUT OF STOCK
    if (product.stock === 0) {
      throw new Error(`${product.name} is out of stock`);
    }

    // OVER STOCK
    if (product.stock < item.quantity) {
      throw new Error(
        `Only ${product.stock} ${product.name} left in stock`
      );
    }

    line_items.push({
      price_data: {
        currency: "usd",

        product_data: {
          name: product.name,

          images: product.images?.[0]?.url
            ? [product.images[0].url]
            : [],

          metadata: {
            productId: product._id.toString(),
          },
        },

        // PRICE FROM DATABASE
        unit_amount: Math.round(product.price * 100),
      },

      quantity: item.quantity,
    });
  }

  // SHIPPING ITEM
  line_items.push({
    price_data: {
      currency: "usd",

      product_data: {
        name: `Shipping (${shippingResult.service_name})`,
      },

      unit_amount: Math.round(
        shippingResult.feeUSD * 100
      ),
    },

    quantity: 1,
  });

  return line_items;
};