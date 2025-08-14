import React from "react";
import styles from "./SettingsModal.module.css";

export default function SettingsModal({ settings, handleChange, onClose }) {
  const inc = (field, step = 1) =>
    handleChange(field, Math.min(9, Math.max(1, (settings[field] || 0) + step)));

  const dec = (field, step = 1) =>
    handleChange(field, Math.min(9, Math.max(1, (settings[field] || 0) - step)));

  const safeParse = (val, def = 1) => {
    const n = parseInt(val, 10);
    if (!Number.isFinite(n)) return def;
    return Math.min(9, Math.max(1, n)); // limite 1 a 9
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header com fundo diferente e X ao lado */}
        <div className={styles.header}>
          <h3>Settings</h3>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {/* Conteúdo */}
        <div className={styles.section}>
          <h4>Number</h4>

          {/* Number of digits com controle ▲ ▼ e foco com brilho */}
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

          {/* Qtd. Números (count) */}
          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Qtd. Números</span>
            <input
              type="number"
              className={styles.input}
              value={settings.count}
              onChange={(e) => handleChange("count", safeParse(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h4>Time</h4>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Flash (ms)</span>
            <input
              type="number"
              className={styles.input}
              value={settings.flashTime}
              onChange={(e) => handleChange("flashTime", safeParse(e.target.value))}
            />
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Intervalo (ms)</span>
            <input
              type="number"
              className={styles.input}
              value={settings.intervalTime}
              onChange={(e) => handleChange("intervalTime", safeParse(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}