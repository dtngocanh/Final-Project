import axios from "axios";

let cachedRate = null;
let lastFetchTime = 0;

export const convertVNDToUSD = async (vnd) => {
  try {
    // Cache 1 giờ
    const ONE_HOUR = 60 * 60 * 1000;

    if (!cachedRate || Date.now() - lastFetchTime > ONE_HOUR) {
      const response = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/VND",
      );

      cachedRate = response.data.rates.USD;

      lastFetchTime = Date.now();
    }

    return Number((vnd * cachedRate).toFixed(2));
  } catch (error) {
    console.error("Convert USD error:", error.message);

    return 0;
  }
};