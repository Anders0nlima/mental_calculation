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

  // Carrega configs iniciais
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckbox = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

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

        <div className={styles.section}>
          <h4>Number</h4>
          <label>
            Number of digits
            <input
              type="number"
              value={settings.digits}
              onChange={(e) => handleChange("digits", parseInt(e.target.value))}
            />
          </label>
          <label>
            Number of rows
            <input
              type="number"
              value={settings.rows}
              onChange={(e) => handleChange("rows", parseInt(e.target.value))}
            />
          </label>
        </div>

        <div className={styles.section}>
          <h4>Time</h4>
          <label>
            Flash (ms)
            <input
              type="number"
              value={settings.flashTime}
              onChange={(e) => handleChange("flashTime", parseInt(e.target.value))}
            />
          </label>
          <label>
            Timeout (ms)
            <input
              type="number"
              value={settings.timeout}
              onChange={(e) => handleChange("timeout", parseInt(e.target.value))}
            />
          </label>
        </div>

        <div className={styles.section}>
          <h4>Mode of operation</h4>
          <label>
            <input
              type="checkbox"
              checked={settings.subtractions}
              onChange={() => handleCheckbox("subtractions")}
            />
            Subtractions
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.continuous}
              onChange={() => handleCheckbox("continuous")}
            />
            Continuous mode (hands free)
          </label>
        </div>

        <div className={styles.section}>
          <h4>Text To Speech</h4>
          <label>
            Voice Language
            <input
              type="text"
              value={settings.voiceLang}
              onChange={(e) => handleChange("voiceLang", e.target.value)}
            />
          </label>
        </div>

        <div className={styles.section}>
          <h4>Font</h4>
          <div className={styles.fontControls}>
            <label>
              Size
              <div className={styles.fontSizeWrapper}>
                <button onClick={() => handleChange("fontSize", settings.fontSize - 1)}>-</button>
                <span>{settings.fontSize}</span>
                <button onClick={() => handleChange("fontSize", settings.fontSize + 1)}>+</button>
              </div>
            </label>
          </div>
          <label>
            Color
            <input
              type="color"
              value={settings.fontColor}
              onChange={(e) => handleChange("fontColor", e.target.value)}
            />
          </label>
          <label>
            Background
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => handleChange("backgroundColor", e.target.value)}
            />
          </label>
        </div>

        <div className={styles.footer}>
          <button onClick={handleSave}>Close</button>
        </div>
      </div>
    </div>
  );
}