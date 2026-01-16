"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import { photoCountLabel } from "../utils";

type User = { id: number; email: string; role: unknown } | null;

type Photo = {
  id: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  uploadedAt?: string;
  filePath?: string;
  PhotoOnClass?: { classId: number }[];
};

type Album = {
  id: number;
  title: string;
  photos: Photo[];
  createdAt: string;
  schoolYear?: string;
  classIds?: number[];
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export default function AlbumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params.id as string;

  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState<Album | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );
  const [uploading, setUploading] = useState(false);

  // Fetch user info
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const data = r.ok ? await r.json() : { user: null };
        if (alive) setUser(data?.user ?? null);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Fetch album photos
  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/photo/event/${albumId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const photos = (data?.photos || []).map((photo: any) => ({
            id: photo.id,
            url: normalizePhotoUrl(photo.filePath),
            alt: `Photo ${photo.id}`,
            uploadedAt: photo.createdAt,
            filePath: photo.filePath,
            PhotoOnClass: photo.PhotoOnClass,
          }));
          const first = data?.photos?.[0];
          setAlbum({
            id: Number(albumId),
            title:
              data?.event?.name || first?.event?.name || `Album ${albumId}`,
            createdAt: first?.createdAt || new Date().toISOString(),
            schoolYear: data?.event?.schoolYear || first?.event?.schoolYear,
            classIds: data?.event?.classIds || [],
            photos,
          });
        } else if (res.status === 404) {
          router.push("/gallery");
        } else {
          console.error("Failed to fetch album:", res.status);
        }
      } catch (err) {
        console.error("Failed to fetch album:", err);
      }
    };
    fetchAlbum();
  }, [albumId, router]);

  const roleKey =
    typeof (user as any)?.role === "string"
      ? String((user as any).role || "").toUpperCase()
      : String(
          (user as any)?.role?.type ??
            (user as any)?.role?.name ??
            (user as any)?.role?.code ??
            (user as any)?.role?.id ??
            ""
        ).toUpperCase();
  const canAddPhotos = roleKey === "TEACHER" || roleKey === "ADMIN";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("photos", file);
      });

      const schoolYear = album?.schoolYear;
      const eventName = album?.title;
      const uniqueClassIds = Array.from(new Set(album?.classIds || []));

      if (!schoolYear || !eventName || uniqueClassIds.length === 0) {
        console.error("Missing schoolYear, eventName or classIds for upload.");
        setUploading(false);
        return;
      }

      formData.append("schoolYear", schoolYear);
      formData.append("eventName", eventName);
      formData.append("classIds", uniqueClassIds.join(","));

      const res = await fetch(`${BACKEND_URL}/api/photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const uploadedPhotos = (data?.files || []).map((file: any) => ({
          id: file.id,
          url: normalizePhotoUrl(file.url),
          alt: file.originalName,
        }));

        setAlbum((prev) =>
          prev
            ? {
                ...prev,
                photos: [...uploadedPhotos, ...prev.photos],
              }
            : prev
        );
      } else {
        console.error("Failed to upload photos:", res.status);
      }
    } catch (err) {
      console.error("Failed to upload photos:", err);
    } finally {
      setUploading(false);
    }
  };

  const closeLightbox = () => setSelectedPhotoIndex(null);

  const showNextPhoto = () => {
    if (!album || album.photos.length === 0 || selectedPhotoIndex === null)
      return;
    setSelectedPhotoIndex((prev) => {
      if (prev === null) return prev;
      return (prev + 1) % album.photos.length;
    });
  };

  const showPrevPhoto = () => {
    if (!album || album.photos.length === 0 || selectedPhotoIndex === null)
      return;
    setSelectedPhotoIndex((prev) => {
      if (prev === null) return prev;
      return (prev - 1 + album.photos.length) % album.photos.length;
    });
  };

  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        showNextPhoto();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        showPrevPhoto();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, album?.photos.length]);

  const handleDeletePhoto = async (photoId: number) => {
    const ok = window.confirm("Naozaj chcete zmazať túto fotku?");
    if (!ok) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/photo/${photoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        console.error("Failed to delete photo:", res.status);
        return;
      }
      setAlbum((prev) =>
        prev
          ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) }
          : prev
      );
    } catch (err) {
      console.error("Failed to delete photo:", err);
    }
  };

  if (!album) {
    return (
      <>
        <Header />
        <div className="gallery-container">
          <p>Načítavam...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="gallery-container">
        <div className="album-detail-header">
          <Link href="/gallery" className="album-back-link">
            ← Späť na fotogalériu
          </Link>
          <div className="album-detail-title-section">
            <h1 className="govuk-heading-xl">{album.title}</h1>
            {canAddPhotos && (
              <label className="govuk-button">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
                {uploading ? "Nahrávam..." : "+ Pridať fotky"}
              </label>
            )}
          </div>
          <p className="album-photo-count">
            {photoCountLabel(album.photos.length)}
          </p>
        </div>

        {album.photos.length === 0 ? (
          <div className="album-empty">
            <p>V tomto albume zatiaľ nie sú žiadne fotky.</p>
            {canAddPhotos && (
              <label className="govuk-button">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
                Pridať prvé fotky
              </label>
            )}
          </div>
        ) : (
          <div className="album-photos-grid">
            {album.photos.map((photo, index) => (
              <div
                key={photo.id}
                className="album-photo-item"
                onClick={() => setSelectedPhotoIndex(index)}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Image
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.alt || `Photo ${photo.id}`}
                    fill
                    className="album-photo-thumbnail"
                    loading="lazy"
                    unoptimized
                  />
                  {canAddPhotos && (
                    <button
                      className="album-photo-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                    >
                      Zmazať
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div className="gallery-lightbox-overlay" onClick={closeLightbox}>
          <div
            className="gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="gallery-lightbox-close"
              onClick={closeLightbox}
              aria-label="Zavrieť"
            >
              ×
            </button>
            <button
              className="gallery-lightbox-nav gallery-lightbox-prev"
              onClick={(e) => {
                e.stopPropagation();
                showPrevPhoto();
              }}
              aria-label="Predchádzajúca fotka"
            >
              ‹
            </button>
            <button
              className="gallery-lightbox-nav gallery-lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                showNextPhoto();
              }}
              aria-label="Nasledujúca fotka"
            >
              ›
            </button>
            <img
              src={album.photos[selectedPhotoIndex].url}
              alt={album.photos[selectedPhotoIndex].alt || "Photo"}
              className="gallery-lightbox-image"
            />
          </div>
        </div>
      )}
    </>
  );
}

function normalizePhotoUrl(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.startsWith("http")) return normalized;
  return `${BACKEND_URL}/${normalized.replace(/^\/+/, "")}`;
}
