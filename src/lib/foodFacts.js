import axios from "axios";

export async function getProductByBarcode(barcode) {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
  );
  const data = await res.json();

  if (data.status !== 1) return null;

  return {
    barcode,
    name: data.product.product_name || "Unknown",
    image: data.product.image_front_small_url || "",
    nutriscore: data.product.nutrition_grades || "unknown",
  };
}
