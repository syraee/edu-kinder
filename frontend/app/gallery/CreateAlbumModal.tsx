"use client";

import { useEffect, useRef, useState } from "react";

type Group = {
  id: number;
  name: string;
};

type CreateAlbumModalProps = {
  open: boolean;
  groups: Group[];
  backendUrl: string;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

const DEFAULT_SCHOOL_YEAR = "2025/26";
const SCHOOL_YEARS = ["2023/24", "2024/25", "2025/26"];

export default function CreateAlbumModal({
  open,
  groups,
  backendUrl,
  onClose,
  onCreated,
}: CreateAlbumModalProps) {
  const [title, setTitle] = useState("");
  const [schoolYear, setSchoolYear] = useState(DEFAULT_SCHOOL_YEAR);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [classSearch, setClassSearch] = useState("");
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const classRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (yearRef.current && !yearRef.current.contains(target)) {
        setYearDropdownOpen(false);
      }
      if (classRef.current && !classRef.current.contains(target)) {
        setClassDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const resetForm = () => {
    setTitle("");
    setSchoolYear(DEFAULT_SCHOOL_YEAR);
    setSelectedClassIds([]);
    setUploadFiles(null);
    setError(null);
    setClassDropdownOpen(false);
    setClassSearch("");
    setYearDropdownOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(classSearch.trim().toLowerCase())
  );

  const handleCreateAlbum = async () => {
    if (!title.trim()) return;
    if (!schoolYear.trim()) {
      setError("Zadajte školský rok.");
      return;
    }
    if (!uploadFiles || uploadFiles.length === 0) {
      setError("Vyberte aspoň jednu fotku.");
      return;
    }
    if (selectedClassIds.length === 0) {
      setError("Vyberte aspoň jednu triedu.");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const formData = new FormData();
      Array.from(uploadFiles).forEach((file) => {
        formData.append("photos", file);
      });
      formData.append("schoolYear", schoolYear.trim());
      formData.append("eventName", title.trim());
      formData.append("classIds", selectedClassIds.join(","));

      const res = await fetch(`${backendUrl}/api/photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        let serverMessage = "";
        try {
          const payload = await res.json();
          serverMessage = payload?.message || payload?.error || "";
        } catch {
          serverMessage = "";
        }

        if (res.status === 413) {
          setError(
            "Súbory sú príliš veľké. Limit je 5MB na fotku a 50 fotiek na jednu dávku."
          );
        } else if (res.status === 400 && serverMessage) {
          setError(serverMessage);
        } else if (res.status === 401 || res.status === 403) {
          setError("Nemáte oprávnenie na vytvorenie albumu.");
        } else {
          setError("Nepodarilo sa vytvoriť album.");
        }
        return;
      }

      await onCreated();
      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to create album:", err);
      setError("Nepodarilo sa vytvoriť album.");
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="gallery-modal-overlay" onClick={handleClose}>
      <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-modal-header">
          <h2>Vytvoriť nový album</h2>
          <button
            className="gallery-modal-close"
            onClick={handleClose}
            aria-label="Zavrieť"
          >
            ×
          </button>
        </div>
        <div className="gallery-modal-body">
          <div className="gallery-modal-grid">
            <div className="gallery-modal-field">
              <label htmlFor="album-title" className="gallery-modal-label">
                Názov albumu
              </label>
              <input
                id="album-title"
                type="text"
                className="gallery-modal-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Napríklad: Výlet do ZOO"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateAlbum();
                }}
              />
            </div>
            <div className="gallery-modal-field">
              <label htmlFor="school-year" className="gallery-modal-label">
                Školský rok
              </label>
              <div className="gallery-dropdown" ref={yearRef}>
                <button
                  type="button"
                  className="gallery-dropdown-trigger"
                  onClick={() => setYearDropdownOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={yearDropdownOpen}
                >
                  {schoolYear}
                  <span className="gallery-dropdown-caret" aria-hidden="true">
                    ▾
                  </span>
                </button>
                {yearDropdownOpen && (
                  <div className="gallery-dropdown-menu" role="listbox">
                    {SCHOOL_YEARS.map((year) => (
                      <button
                        key={year}
                        type="button"
                        className="gallery-dropdown-option"
                        onClick={() => {
                          setSchoolYear(year);
                          setYearDropdownOpen(false);
                        }}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="gallery-modal-field">
              <label className="gallery-modal-label">Triedy</label>
              <div className="gallery-dropdown" ref={classRef}>
                <button
                  type="button"
                  className="gallery-dropdown-trigger"
                  onClick={() => setClassDropdownOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={classDropdownOpen}
                >
                  {selectedClassIds.length > 0
                    ? `${selectedClassIds.length} vybraté`
                    : "Vyberte triedy"}
                  <span className="gallery-dropdown-caret" aria-hidden="true">
                    ▾
                  </span>
                </button>
                {classDropdownOpen && (
                  <div className="gallery-dropdown-menu" role="listbox">
                    <div className="gallery-dropdown-search">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={classSearch}
                        onChange={(e) => setClassSearch(e.target.value)}
                      />
                    </div>
                    {groups.length === 0 ? (
                      <div className="gallery-dropdown-empty">Žiadne triedy</div>
                    ) : filteredGroups.length === 0 ? (
                      <div className="gallery-dropdown-empty">
                        Žiadne výsledky
                      </div>
                    ) : (
                      filteredGroups.map((group) => (
                        <label key={group.id} className="gallery-dropdown-item">
                          <input
                            type="checkbox"
                            checked={selectedClassIds.includes(group.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClassIds((prev) => [
                                  ...prev,
                                  group.id,
                                ]);
                              } else {
                                setSelectedClassIds((prev) =>
                                  prev.filter((id) => id !== group.id)
                                );
                              }
                            }}
                          />
                          <span>{group.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="gallery-modal-field">
              <label htmlFor="album-files" className="gallery-modal-label">
                Fotky
              </label>
              <input
                id="album-files"
                type="file"
                className="gallery-modal-input"
                accept="image/*"
                multiple
                onChange={(e) => setUploadFiles(e.target.files)}
              />
            </div>
          </div>
          {error && <p className="govuk-error-message">{error}</p>}
        </div>
        <div className="gallery-modal-footer">
          <button
            className="gallery-modal-btn gallery-modal-btn-secondary"
            onClick={handleClose}
          >
            Zrušiť
          </button>
          <button
            className="gallery-modal-btn gallery-modal-btn-primary"
            onClick={handleCreateAlbum}
            disabled={!title.trim() || creating}
          >
            {creating ? "Vytváram..." : "Vytvoriť"}
          </button>
        </div>
      </div>
    </div>
  );
}
