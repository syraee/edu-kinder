"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "banner_dismissed";

export default function TestBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY) === "1";
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, []);

  const close = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  if (!visible) return null;

  return (
    <div className="test-banner" role="status" aria-live="polite">
      <div className="test-banner__inner govuk-width-container">
        <div className="test-banner__text">
          Toto je testovacia aplikácia. Údaje môžu byť dočasné.
        </div>

        <button
          type="button"
          className="test-banner__close"
          onClick={close}
          aria-label="Zavrieť oznámenie"
        >
          ×
        </button>
      </div>
    </div>
  );
}
