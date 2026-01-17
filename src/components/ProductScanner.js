import { useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

const BarcodeScanner = dynamic(() => import("react-qr-barcode-scanner"), { ssr: false });

export default function ProductScanner() {
  const [barcode, setBarcode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [product, setProduct] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchByBarcode = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/openfoodfacts?barcode=${barcode}`);
      const data = await res.json();
      if (!data.error) setProduct(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const searchByName = async () => {
    if (!searchName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search-products?query=${searchName}`);
      const data = await res.json();
      if (!data.error) setResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const saveProduct = async (p) => {
    try {
      await axios.post("/api/products", p);
      alert("Saved!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to save product");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Scan or Search Product</h2>

      {/* Barcode */}
      <input
        type="text"
        placeholder="Enter barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />
      <button onClick={searchByBarcode}>Search by Barcode</button>

      <hr />

      {/* Name search */}
      <input
        type="text"
        placeholder="Search by product name"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
      />
      <button onClick={searchByName}>Search</button>

      {loading && <p>Loading...</p>}

      {/* Single product */}
      {product && (
        <div style={{ border: "1px solid #ccc", padding: 8, margin: 8 }}>
          <h3>{product.name}</h3>
          {product.image && <img src={product.image} width={100} />}
          <p>Nutri-Score: {product.nutriscore}</p>
          <button onClick={() => saveProduct(product)}>Save</button>
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div>
          <h3>Results</h3>
          {results.map((p) => (
            <div
              key={p.barcode}
              style={{ border: "1px solid #ccc", padding: 8, margin: 8 }}
            >
              <strong>{p.name}</strong>
              {p.image && <img src={p.image} width={80} />}
              <p>Nutri-Score: {p.nutriscore}</p>
              <button onClick={() => saveProduct(p)}>Save</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
