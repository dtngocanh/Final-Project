export const createStripeLineItems = async ({
  orderItems,
  shippingResult,
}) => {

  const line_items = orderItems.map((item) => ({
    price_data: {
      currency: "usd",

      product_data: {
        name: item.name,

        images: item.image
          ? [item.image]
          : [],

        metadata: {
          productId: item.product.toString(),
        },
      },

      unit_amount: Math.round(item.price * 100),
    },

    quantity: item.quantity,
  }));

  // shipping item
  line_items.push({
    price_data: {
      currency: "usd",

      product_data: {
        name:
          `Shipping (${shippingResult.service_name})`,
      },

      unit_amount:
        Math.round(shippingResult.feeUSD * 100),
    },

    quantity: 1,
  });

  return line_items;
};