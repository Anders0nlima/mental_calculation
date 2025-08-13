import React, { useState, useEffect } from "react";
import styles from "./SettingsModal.module.css";

export default function SettingsModal({ onClose, onSave, initialSettings }) {
  const [settings, setSettings] = useState({
    digits: 1,
    rows: 5,
    flashTime: 500,
    timeout: 500,
    subtractions: false,
    continuous: false,
    voiceLang: "en-US",
    fontSize: 316.5,
    fontColor: "#ffffff",
    backgroundColor: "#a0b4c9"
  });

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (field, value) =>
    setSettings(prev => ({ ...prev, [field]: value }));

  const handleCheckbox = (field) =>
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));

  const handleSave = () => {
    onSave(settings);
    onClose();
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
            <input
              type="number"
              className={styles.input}
              value={settings.digits}
              onChange={(e) =>
                handleChange("digits", parseInt(e.target.value || "0", 10))
              }
            />
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Number of rows</span>
            <input
              type="number"
              className={styles.input}
              value={settings.rows}
              onChange={(e) =>
                handleChange("rows", parseInt(e.target.value || "0", 10))
              }
            />
          </div>
        </div>

        {/* Time */}
        <div className={styles.section}>
          <h4>Time</h4>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Flash (ms)</span>
            <input
              type="number"
              className={styles.input}
              value={settings.flashTime}
              onChange={(e) =>
                handleChange("flashTime", parseInt(e.target.value || "0", 10))
              }
            />
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Timeout (ms)</span>
            <input
              type="number"
              className={styles.input}
              value={settings.timeout}
              onChange={(e) =>
                handleChange("timeout", parseInt(e.target.value || "0", 10))
              }
            />
          </div>
        </div>

        {/* Mode of operation */}
        <div className={styles.section}>
          <h4>Mode of operation</h4>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={settings.subtractions}
              onChange={() => handleCheckbox("subtractions")}
            />
            Subtractions
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={settings.continuous}
              onChange={() => handleCheckbox("continuous")}
            />
            Continuous mode (hands free)
          </label>
        </div>

        {/* Text To Speech */}
        <div className={styles.section}>
          <h4>Text To Speech</h4>
          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Voice Language</span>
            <select
              className={`${styles.input} ${styles.select}`}
              value={settings.voiceLang}
              onChange={(e) => handleChange("voiceLang", e.target.value)}
            >
              <option value="en-US">en-US</option>
              <option value="pt-BR">pt-BR</option>
              <option value="ja-JP">ja-JP</option>
            </select>
          </div>
        </div>

        {/* Font */}
        <div className={styles.section}>
          <h4>Font</h4>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Size</span>
            <div className={`${styles.input} ${styles.fontSizeCtrl}`}>
              <button
                type="button"
                onClick={() => handleChange("fontSize", Math.max(1, settings.fontSize - 1))}
              >
                −
              </button>
              <span className={styles.fontSizeValue}>{settings.fontSize}</span>
              <button
                type="button"
                onClick={() => handleChange("fontSize", settings.fontSize + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Color</span>
            <input
              type="color"
              className={`${styles.input} ${styles.color}`}
              value={settings.fontColor}
              onChange={(e) => handleChange("fontColor", e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.prepend}>Background</span>
            <input
              type="color"
              className={`${styles.input} ${styles.color}`}
              value={settings.backgroundColor}
              onChange={(e) => handleChange("backgroundColor", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={handleSave}>Close</button>
        </div>
      </div>
    </div>
  );
}