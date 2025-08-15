import React from "react";
import styles from "./SettingsModal.module.css";

export default function SettingsModal({ settings, handleChange, onClose }) {
  const inc = (field, step = 1, max = 9) =>
    handleChange(field, Math.min(max, Math.max(1, (settings[field] || 0) + step)));

  const dec = (field, step = 1, max = 9) =>
    handleChange(field, Math.min(max, Math.max(1, (settings[field] || 0) - step)));

  const safeParse = (val, def = 1, min = 1, max = 9) => {
    const n = parseInt(val, 10);
    if (!Number.isFinite(n)) return def;
    return Math.min(max, Math.max(min, n));
  };

  const safeParseMs = (val, def = 1000, min = 50, max = 5000) => {
    const n = parseInt(val, 10);
    if (!Number.isFinite(n)) return def;
    return Math.min(max, Math.max(min, n));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Settings</h3>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {/* Number */}
        <div className={styles.section}>
          <h4>Number</h4>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Number of digits</span>
            <div className={styles.numberControl}>
              <input
                type="number"
                className={styles.numberInput}
                value={settings.digits}
                onChange={(e) =>
                  handleChange("digits", safeParse(e.target.value))
                }
              />
              <div className={styles.buttons}>
                <button type="button" onClick={() => inc("digits")}>▲</button>
                <button type="button" onClick={() => dec("digits")}>▼</button>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Qtd. Números</span>
            <div className={styles.numberControl}>
              <input
                type="number"
                className={styles.numberInput}
                value={settings.count}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    handleChange("count", Math.max(2, Math.min(25, val)));
                  }
                }}
              />
              <div className={styles.buttons}>
                <button
                  type="button"
                  onClick={() =>
                    handleChange("count", Math.min(25, (settings.count || 2) + 1))
                  }
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleChange("count", Math.max(2, (settings.count || 2) - 1))
                  }
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Time */}
        <div className={styles.section}>
          <h4>Time</h4>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Flash (ms)</span>
            <div className={styles.numberControl}>
              <input
                type="number"
                className={styles.numberInput}
                value={settings.flashTime || 1000}
                onChange={(e) => {
                  const val = safeParseMs(e.target.value, 1000, 50, 5000);
                  handleChange("flashTime", val);
                }}
              />
              <div className={styles.buttons}>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(5000, (settings.flashTime || 1000) + 50);
                    handleChange("flashTime", newVal);
                  }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(50, (settings.flashTime || 1000) - 50);
                    handleChange("flashTime", newVal);
                  }}
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Intervalo (ms)</span>
            <div className={styles.numberControl}>
              <input
                type="number"
                className={styles.numberInput}
                value={settings.intervalTime || 1000}
                onChange={(e) => {
                  const val = safeParseMs(e.target.value, 1000, 50, 5000);
                  handleChange("intervalTime", val);
                }}
              />
              <div className={styles.buttons}>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(5000, (settings.intervalTime || 1000) + 50);
                    handleChange("intervalTime", newVal);
                  }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(50, (settings.intervalTime || 1000) - 50);
                    handleChange("intervalTime", newVal);
                  }}
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}