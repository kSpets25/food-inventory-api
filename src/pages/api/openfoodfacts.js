export default async function handler(req, res) {
  const { barcode } = req.query;

  if (!barcode) return res.status(400).json({ error: "Barcode required" });

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await response.json();

    if (data.status !== 1) return res.status(404).json({ error: "Product not found" });

    const product = {
      barcode,
      name: data.product.product_name || "Unknown",
      image: data.product.image_front_small_url || "",
      nutriscore: data.product.nutrition_grades || "unknown",
    };

    res.status(200).json(product);
  } catch (err) {
    console.error("OpenFoodFacts Error:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}

  