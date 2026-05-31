import Product from "../models/Product.js";

export const createStripeLineItems = async ({
  orderItems,
  shippingResult,
}) => {
  const line_items = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error(`${item.name || 'Product'} not found`);
    }

    if (item.quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: product.images?.[0]?.url ? [product.images[0].url] : [],
        },
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
        name: `Shipping (${shippingResult.service_name || 'Standard'})`,
      },
      unit_amount: Math.round(shippingResult.feeUSD * 100),
    },
    quantity: 1,
  });

  return line_items;
};