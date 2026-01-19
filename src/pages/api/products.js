import connectToDatabase from "../../lib/mongodb";
import Product from "../../models/product";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await connectToDatabase();

      const { barcode, name, image, nutriscore, swapScore, sugarLevel } = req.body;

      // Check if product already exists in inventory
      let existing = await Product.findOne({ barcode });
      if (existing) {
        return res.status(400).json({ error: "Product already in inventory" });
      }

      const product = new Product({
        barcode,
        name,
        image,
        nutriscore,
        swapScore,
        sugarLevel,
      });

      await product.save();

      res.status(200).json({ message: "Product saved", product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save product" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
