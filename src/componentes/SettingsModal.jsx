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
                onChange={(e) => handleChange("digits", safeParse(e.target.value))}
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
                  if (!isNaN(val)) handleChange("count", Math.max(2, Math.min(25, val)));
                }}
              />
              <div className={styles.buttons}>
                <button type="button" onClick={() => handleChange("count", Math.min(25, (settings.count || 2) + 1))}>▲</button>
                <button type="button" onClick={() => handleChange("count", Math.max(2, (settings.count || 2) - 1))}>▼</button>
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
                <button type="button" onClick={() => handleChange("flashTime", Math.min(5000, (settings.flashTime || 1000) + 50))}>▲</button>
                <button type="button" onClick={() => handleChange("flashTime", Math.max(50, (settings.flashTime || 1000) - 50))}>▼</button>
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
                <button type="button" onClick={() => handleChange("intervalTime", Math.min(5000, (settings.intervalTime || 1000) + 50))}>▲</button>
                <button type="button" onClick={() => handleChange("intervalTime", Math.max(50, (settings.intervalTime || 1000) - 50))}>▼</button>
              </div>
            </div>
          </div>
        </div>

        {/* Voice */}
        <div className={styles.section}>
          <h4>Voice</h4>
          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Ler números em voz alta</span>
            <button
              type="button"
              className={`${styles.toggleBtn} ${settings.voice ? styles.active : ""}`}
              onClick={() => handleChange("voice", !settings.voice)}
            >
              {settings.voice ? "🔊 Ativado" : "🔇 Desativado"}
            </button>
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Idioma</span>
            <select
              className={styles.select}
              value={settings.language}
              onChange={(e) => handleChange("language", e.target.value)}
            >
              <option value="pt-BR">Português</option>
              <option value="en-US">Inglês</option>
              <option value="es-ES">Espanhol</option>
              <option value="fr-FR">Francês</option>
              <option value="de-DE">Alemão</option>
            </select>
          </div>
        </div>

        {/* Mode of operation (accessories) */}
        <div className={styles.section}>
          <h4>Mode of operation</h4>

          <div className={styles.inputGroup}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={settings.subtractions || false}
                onChange={(e) => handleChange("subtractions", e.target.checked)}
              />
              Subtractions (mix + and -)
            </label>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={settings.continuous || false}
                onChange={(e) => handleChange("continuous", e.target.checked)}
              />
              Continuous mode (hands free)
            </label>
          </div>
        </div>

        {/* Font */}
        <div className={styles.section}>
          <h4>Font</h4>
          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Size</span>
            <div className={styles.numberControl}>
              <input
                type="number"
                className={styles.numberInput}
                value={settings.fontSize || 100}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) handleChange("fontSize", Math.max(10, Math.min(500, val)));
                }}
              />
              <div className={styles.buttons}>
                <button type="button" onClick={() => handleChange("fontSize", Math.min(500, (settings.fontSize || 100) + 5))}>+</button>
                <button type="button" onClick={() => handleChange("fontSize", Math.min(500, (settings.fontSize || 100) - 5))}>−</button>

              </div>
            </div>
          </div>
          <p className={styles.helperText}>
            The current font size is {settings.fontSize || 100}
          </p>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}