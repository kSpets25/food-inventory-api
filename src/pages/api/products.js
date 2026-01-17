import connectToDatabase from "../../lib/mongodb";
import Product from "../models/product";

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    if (req.method === "POST") {
      const { barcode, name, image, nutriscore } = req.body;

      if (!barcode || !name) {
        return res.status(400).json({ error: "Barcode and name are required" });
      }

      const product = await Product.create({ barcode, name, image, nutriscore });
      return res.status(201).json(product);
    }

    if (req.method === "GET") {
      const products = await Product.find({});
      return res.status(200).json(products);
    }

    res.status(405).end();
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
