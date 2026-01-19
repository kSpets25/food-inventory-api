import { useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import styles from "./ProductScanner.module.css";

const BarcodeScanner = dynamic(() => import("react-qr-barcode-scanner"), { ssr: false });

// ------------------ SWAP calculation ------------------
function calculateSwap(nutrients) {
  if (!nutrients) return 3;

  let score = 3; // neutral starting point

  const sugar = nutrients.sugars_100g ?? 0;
  const carbs = nutrients.carbohydrates_100g ?? 0; // NEW: total carbs
  const sodium = nutrients.salt_100g ?? 0;
  const satFat = nutrients["saturated-fat_100g"] ?? 0;
  const fiber = nutrients.fiber_100g ?? 0;
  const protein = nutrients.proteins_100g ?? 0;

  // --- Penalize unhealthy nutrients ---
  if (sugar > 20) score -= 3;
  else if (sugar > 15) score -= 2;
  else if (sugar > 10) score -= 1;

  if (carbs > 60) score -= 2;       // heavy carbs
  else if (carbs > 40) score -= 1;  // moderate carbs

  if (sodium > 0.5) score--;
  if (satFat > 5) score--;

  // --- Reward healthy nutrients ---
  if (fiber >= 3) score++;
  if (protein >= 5) score++;

  // Clamp final score between 1 and 5
  return Math.min(Math.max(score, 1), 5);
}

// ------------------ Color coding ------------------
function getNutriScoreColor(score) {
  const colors = { a: "green", b: "lightgreen", c: "yellow", d: "orange", e: "red" };
  return colors[score?.toLowerCase()] || "gray";
}

function getSwapColor(score) {
  if (score === 5) return "green";
  if (score === 4) return "lightgreen";
  if (score === 3) return "yellow";
  if (score === 2) return "orange";
  return "red";
}

function getSugarColor(sugar) {
  if (sugar <= 5) return "green";
  if (sugar <= 12.5) return "yellow";
  return "red";
}

// ------------------ Component ------------------
export default function ProductScanner() {
  const [barcode, setBarcode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [product, setProduct] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ------------------ Fetch by barcode ------------------
  const searchByBarcode = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/openfoodfacts?barcode=${barcode}`);
      const data = await res.json();
      if (!data.error) {
        data.swapScore = calculateSwap(data.nutriments);
        data.sugarLevel = data.nutriments?.sugars_100g ?? 0;
        setProduct(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ------------------ Search by name ------------------
  const searchByName = async () => {
    if (!searchName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search-products?query=${searchName}`);
      const data = await res.json();
      if (!data.error) {
        const enriched = data.map((p) => ({
          ...p,
          swapScore: calculateSwap(p.nutriments),
          sugarLevel: p.nutriments?.sugars_100g ?? 0,
        }));
        setResults(enriched);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ------------------ Save product ------------------
  const saveProduct = async (p) => {
    try {
      await axios.post("/api/products", p);
      alert("Saved!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to save product");
    }
  };

  // ------------------ Render product card ------------------
  const renderProductCard = (p) => (
    <div key={p.barcode} className={styles.productCard}>
      <h3>{p.name}</h3>
      <p>Barcode: <strong>{p.barcode}</strong></p>
      {p.image && <img src={p.image} className={styles.imgSmall} />}
      <p>
        Nutri-Score:{" "}
        <span className={styles.badge} style={{ backgroundColor: getNutriScoreColor(p.nutriscore) }}>
          {p.nutriscore?.toUpperCase() || "N/A"}
        </span>
      </p>
      <p>
        SWAP Score:{" "}
        <span className={styles.badge} style={{ backgroundColor: getSwapColor(p.swapScore) }}>
          {p.swapScore}
        </span>
      </p>
      <p>
        Sugar (g/100g):{" "}
        <span className={styles.badge} style={{ backgroundColor: getSugarColor(p.sugarLevel) }}>
          {p.sugarLevel}
        </span>
      </p>
      <button onClick={() => saveProduct(p)}>Save</button>
    </div>
  );

  return (
    <div className={styles.container}>
      <h2>Scan or Search Product</h2>

      <div className={styles.inputGroup}>
  {/* Barcode Search */}
  <input
    type="text"
    placeholder="Enter barcode"
    value={barcode}
    onChange={(e) => setBarcode(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // prevent page reload
        if (barcode.trim()) searchByBarcode();
      }
    }}
  />
  <button onClick={searchByBarcode}>Search by Barcode</button>
</div>

      <div className={styles.inputGroup}>
        {/* Name Search */}
        <input
          type="text"
          placeholder="Search by product name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // prevent page reload
              if (searchName.trim()) searchByName();
            }
          }}
        />
        <button onClick={searchByName}>Search</button>
      </div>


      {loading && <p>Loading...</p>}

      {product && renderProductCard(product)}

      {results.length > 0 && (
        <div className={styles.resultsContainer}>
          <h3>Results</h3>
          {results.map((p) => renderProductCard(p))}
        </div>
      )}
    </div>
  );
}
