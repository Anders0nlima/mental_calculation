import React from "react";
import styles from "./HistoryModal.module.css";

export default function HistoryModal({ isOpen, onClose, history }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>History (last 20 entries)</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.historyList}>
          {history.length === 0 ? (
            <p>No history yet.</p>
          ) : (
            history.map((entry, index) => (
              <div key={index} className={styles.historyItem}>
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}