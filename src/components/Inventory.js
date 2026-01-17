import { useEffect, useState } from "react";
import axios from "axios";

export default function Inventory() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  return (
    <div>
      <h2>Inventory</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {products.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ccc", padding: "10px" }}>
            <img src={p.image} alt={p.name} width={100} />
            <p>{p.name}</p>
            <p>Nutri-Score: {p.nutriscore}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
