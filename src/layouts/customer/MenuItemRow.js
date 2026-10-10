import React, { useState } from "react";

   <MenuItemRow
     item={{
       id: "spanish-latte",
       name: "Spanish Latte",
        image: spanishLatte,
        sizes: [
          { label: "8 oz",  price: 65 },
          { label: "12 oz", price: 75 },
          { label: "16 oz", price: 85 },
          { label: "24 oz", price: 105 },
       ],
      }}
      quantities={cart}                      
     onChange={(key, qty) => setCart(c => ({ ...c, [key]: qty }))}
   />


const GREEN = "#1f6b45";
const BORDER = "#e3ddd2";
const CHIP_ACTIVE = "#2f4a2a"; // dark green (selected)
const CHIP_BG = "#fbf6ec"; // cream (unselected)
const CHIP_BORDER = "#e3d6bf";

const styles = {
  row: {
    display: "flex",
    gap: 12,
    padding: "14px 0",
    borderBottom: `1px solid ${BORDER}`,
  },
  img: {
    width: 56,
    height: 56,
    borderRadius: 10,
    objectFit: "cover",
    background: "#e8e2d7",
    flexShrink: 0,
  },
  body: { flex: 1, minWidth: 0 },
  top: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { fontSize: 16, fontWeight: 600, margin: 0 },
  price: { fontSize: 13, color: "#6b6558", marginTop: 2 },
  sizes: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chip: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: active ? 700 : 600,
    cursor: "pointer",
    border: `1px solid ${active ? CHIP_ACTIVE : CHIP_BORDER}`,
    background: active ? CHIP_ACTIVE : CHIP_BG,
    color: active ? "#fff" : "#2b1d12",
    transition: "background .15s, border-color .15s",
  }),
  stepper: { display: "flex", alignItems: "center", gap: 8 },
  stepBtn: (disabled) => ({
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: `1px solid ${BORDER}`,
    background: "#fff",
    fontSize: 18,
    lineHeight: 1,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1,
  }),
  qty: { minWidth: 18, textAlign: "center", fontWeight: 700 },
};

export default function MenuItemRow({ item, quantities = {}, onChange }) {
  // default to the middle-ish size (16 oz if available, otherwise first)
  const defaultSize =
    item.sizes.find((s) => s.label.replace(" ", "") === "16oz") ||
    item.sizes[0];
  const [selected, setSelected] = useState(defaultSize);

  const key = `${item.id}|${selected.label}`;
  const qty = quantities[key] || 0;

  const setQty = (n) => onChange && onChange(key, Math.max(0, n));

  return (
    <div style={styles.row}>
      {item.image && <img src={item.image} alt={item.name} style={styles.img} />}

      <div style={styles.body}>
        <div style={styles.top}>
          <div>
            <p style={styles.name}>{item.name}</p>
            <div style={styles.price}>₱{selected.price}</div>
          </div>

          <div style={styles.stepper}>
            <button
              type="button"
              aria-label={`Remove one ${selected.label} ${item.name}`}
              style={styles.stepBtn(qty === 0)}
              disabled={qty === 0}
              onClick={() => setQty(qty - 1)}
            >
              −
            </button>
            <span style={styles.qty}>{qty}</span>
            <button
              type="button"
              aria-label={`Add one ${selected.label} ${item.name}`}
              style={styles.stepBtn(false)}
              onClick={() => setQty(qty + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Horizontal size picker */}
        <div style={styles.sizes} role="radiogroup" aria-label="Choose size">
          {item.sizes.map((s) => {
            const active = s.label === selected.label;
            const count = quantities[`${item.id}|${s.label}`] || 0;
            return (
              <button
                key={s.label}
                type="button"
                role="radio"
                aria-checked={active}
                style={styles.chip(active)}
                onClick={() => setSelected(s)}
              >
                {active && <span aria-hidden="true">✓</span>}
                {s.label}
                {count > 0 && ` ×${count}`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}