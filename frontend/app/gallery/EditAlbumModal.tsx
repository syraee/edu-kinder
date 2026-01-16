"use client";

import { useEffect, useRef, useState } from "react";

type Group = {
  id: number;
  name: string;
};

type EditableAlbum = {
  id: number;
  title: string;
  schoolYear?: string;
  classIds?: number[];
};

type EditAlbumModalProps = {
  album: EditableAlbum | null;
  groups: Group[];
  backendUrl: string;
  onClose: () => void;
  onUpdated: () => Promise<void>;
};

export default function EditAlbumModal({
  album,
  groups,
  backendUrl,
  onClose,
  onUpdated,
}: EditAlbumModalProps) {
  const [title, setTitle] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [classIds, setClassIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [classSearch, setClassSearch] = useState("");
  const classRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!album) return;
    setTitle(album.title || "");
    setSchoolYear(album.schoolYear || "");
    setClassIds(album.classIds || []);
    setError(null);
    setClassSearch("");
    setDropdownOpen(false);
  }, [album]);

  useEffect(() => {
    if (!album) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (classRef.current && !classRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [album]);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(classSearch.trim().toLowerCase())
  );

  const handleClose = () => {
    setError(null);
    setClassSearch("");
    setDropdownOpen(false);
    onClose();
  };

  const handleEditAlbum = async () => {
    if (!album) return;
    if (!title.trim() || !schoolYear.trim()) {
      setError("Vyplňte názov a školský rok.");
      return;
    }
    if (classIds.length === 0) {
      setError("Vyberte aspoň jednu triedu.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/api/photo/event/${album.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: title.trim(),
          schoolYear: schoolYear.trim(),
          classIds,
        }),
      });

      if (!res.ok) {
        setError("Nepodarilo sa upraviť album.");
        return;
      }

      await onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to edit album:", err);
      setError("Nepodarilo sa upraviť album.");
    } finally {
      setSaving(false);
    }
  };

  if (!album) return null;

  return (
    <div className="gallery-modal-overlay" onClick={handleClose}>
      <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-modal-header">
          <h2>Upraviť album</h2>
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
              <label htmlFor="edit-title" className="gallery-modal-label">
                Názov albumu
              </label>
              <input
                id="edit-title"
                type="text"
                className="gallery-modal-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="gallery-modal-field">
              <label htmlFor="edit-year" className="gallery-modal-label">
                Školský rok
              </label>
              <input
                id="edit-year"
                type="text"
                className="gallery-modal-input"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
              />
            </div>
            <div className="gallery-modal-field">
              <label className="gallery-modal-label">Triedy</label>
              <div className="gallery-dropdown" ref={classRef}>
                <button
                  type="button"
                  className="gallery-dropdown-trigger"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  {classIds.length > 0
                    ? `${classIds.length} vybraté`
                    : "Vyberte triedy"}
                  <span className="gallery-dropdown-caret" aria-hidden="true">
                    ▾
                  </span>
                </button>
                {dropdownOpen && (
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
                            checked={classIds.includes(group.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setClassIds((prev) => [...prev, group.id]);
                              } else {
                                setClassIds((prev) =>
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
            onClick={handleEditAlbum}
            disabled={saving}
          >
            {saving ? "Ukladám..." : "Uložiť"}
          </button>
        </div>
      </div>
    </div>
  );
}
