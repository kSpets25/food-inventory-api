export default async function handler(req, res) {
    const { query } = req.query;
  
    if (!query || query.length < 2) return res.status(400).json({ error: "Query too short" });
  
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=10`;
  
      const response = await fetch(url);
      const data = await response.json();
  
      const products = (data.products || []).map((p) => ({
        barcode: p.code,
        name: p.product_name || "Unknown",
        image: p.image_front_small_url || "",
        nutriscore: p.nutrition_grades || "unknown",
      }));
  
      res.status(200).json(products);
    } catch (err) {
      console.error("Search API Error:", err);
      res.status(500).json({ error: "Search failed" });
    }
  }
  