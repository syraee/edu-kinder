"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import { getRoleKey, photoCountLabel, formatDateSk } from "./utils";
import CreateAlbumModal from "./CreateAlbumModal";
import EditAlbumModal from "./EditAlbumModal";

type Album = {
  id: number;
  title: string;
  coverImage?: string;
  photoCount: number;
  createdAt: string;
  updatedAt?: string;
  schoolYear?: string;
  classIds?: number[];
};

type Photo = {
  id: number;
  filePath: string;
  createdAt: string;
  eventId: number;
  event?: { id: number; name: string; schoolYear: string };
  PhotoOnClass?: { classId: number }[];
};

type Group = { id: number; name: string };

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://localhost:5000";
type User = { id: number; email: string; role: unknown } | null;

export default function GalleryPage() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [albumsError, setAlbumsError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);

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

  const fetchAlbums = async () => {
    if (loading) return;
    setAlbumsLoading(true);
    setAlbumsError(null);

    try {
      const roleKey = getRoleKey(user);
      const canSeeAll = roleKey === "TEACHER" || roleKey === "ADMIN";

      let classIds: number[] = [];

      if (canSeeAll) {
        const groupsRes = await fetch(`${BACKEND_URL}/api/group`, {
          credentials: "include",
        });
        if (!groupsRes.ok) {
          setAlbumsError("Nepodarilo sa načítať triedy.");
          setAlbums([]);
          return;
        }
        const groupsData = await groupsRes.json();
        const fetchedGroups: Group[] = groupsData?.data || [];
        setGroups(fetchedGroups);
        classIds = fetchedGroups.map((g) => g.id);
      } else {
        setGroups([]);
        const childrenRes = await fetch(`${BACKEND_URL}/api/child/mine`, {
          credentials: "include",
        });
        if (!childrenRes.ok) {
          setAlbumsError("Nemáte prístup k fotogalérii.");
          setAlbums([]);
          return;
        }
        const childrenData = await childrenRes.json();
        const children = childrenData?.data || [];
        const ids = children.map((c: { groupId?: number }) => c.groupId);
        classIds = Array.from(
          new Set(ids.filter((id: number | undefined) => Number.isFinite(id)))
        );
      }

      if (classIds.length === 0) {
        setAlbums([]);
        return;
      }

      const batchRes = await fetch(`${BACKEND_URL}/api/photo/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ classIds }),
      });
      if (!batchRes.ok) {
        setAlbumsError("Nepodarilo sa načítať albumy.");
        setAlbums([]);
        return;
      }
      const batchData = await batchRes.json();
      const events = batchData?.events || [];

      const albumsList: Album[] = events.map((entry: any) => {
        const photos: Photo[] = entry.photos || [];
        const sorted = [...photos].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const first = sorted[0];
        const event = entry.event || first?.event;
        const coverPath = first?.filePath
          ? normalizePhotoUrl(first.filePath)
          : undefined;
        const classIds = Array.from(
          new Set(
            photos.flatMap((photo) =>
              (photo.PhotoOnClass || []).map((p) => p.classId)
            )
          )
        );
        return {
          id: event?.id ?? first?.eventId,
          title: event?.name || `Album ${event?.id ?? ""}`,
          coverImage: coverPath,
          photoCount: photos.length,
          createdAt: first?.createdAt || new Date().toISOString(),
          schoolYear: event?.schoolYear,
          classIds,
        };
      });

      albumsList.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAlbums(albumsList);
    } catch (err) {
      console.error("Failed to fetch albums:", err);
      setAlbumsError("Nepodarilo sa načítať albumy.");
    } finally {
      setAlbumsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [loading, user]);

  // Fetch groups when modal opens (for admin/teacher users)
  useEffect(() => {
    if (!showCreateModal || !user || groups.length > 0) return;

    const roleText =
      typeof (user as any)?.role === "string"
        ? (user as any).role
        : (user as any)?.role?.name ??
          (user as any)?.role?.code ??
          (user as any)?.role?.type ??
          (user as any)?.role?.id ??
          "";
    const roleKey = String(roleText || "").toUpperCase();
    const canSeeAll = roleKey === "TEACHER" || roleKey === "ADMIN";

    if (canSeeAll) {
      (async () => {
        try {
          const groupsRes = await fetch(`${BACKEND_URL}/api/group`, {
            credentials: "include",
          });
          if (groupsRes.ok) {
            const groupsData = await groupsRes.json();
            const fetchedGroups: Group[] = groupsData?.data || [];
            setGroups(fetchedGroups);
          }
        } catch (err) {
          console.error("Failed to fetch groups:", err);
        }
      })();
    }
  }, [showCreateModal, user, groups.length]);

  const roleKey = getRoleKey(user);
  const canCreateAlbums = roleKey === "TEACHER" || roleKey === "ADMIN";

  const openEditModal = (album: Album) => {
    setEditAlbum(album);
  };

  const handleDeleteAlbum = async (albumId: number, title: string) => {
    const ok = window.confirm(`Naozaj chcete zmazať album "${title}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/photo/event/${albumId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        console.error("Failed to delete album:", res.status);
        return;
      }
      await fetchAlbums();
    } catch (err) {
      console.error("Failed to delete album:", err);
    }
  };

  const formatDate = formatDateSk;

  return (
    <>
      <Header />
      <div className="gallery-container">
        <div className="gallery-header">
          <h1 className="govuk-heading-xl">Fotogaléria</h1>
          {canCreateAlbums && (
            <div className="gallery-header-actions">
              <button
                className="govuk-button"
                onClick={() => setShowCreateModal(true)}
                aria-label="Vytvoriť nový album"
              >
                Vytvoriť album
              </button>
            </div>
          )}
        </div>

        {albumsLoading ? (
          <div className="gallery-empty">
            <p>Načítavam albumy...</p>
          </div>
        ) : albumsError ? (
          <div className="gallery-empty">
            <p>{albumsError}</p>
          </div>
        ) : albums.length === 0 ? (
          <div className="gallery-empty">
            <p>Zatiaľ nie sú žiadne albumy.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/gallery/${album.id}`}
                className="gallery-album-card"
              >
                <div className="gallery-album-cover">
                  {album.coverImage ? (
                    <Image
                      src={album.coverImage}
                      alt={album.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="gallery-album-image"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  ) : (
                    <div className="gallery-album-placeholder">
                      <span className="gallery-placeholder-icon">📷</span>
                    </div>
                  )}
                  <div className="gallery-album-overlay">
                    <span className="gallery-album-count">
                      {photoCountLabel(album.photoCount)}
                    </span>
                  </div>
                  {canCreateAlbums && (
                    <div className="gallery-album-actions">
                      <button
                        className="gallery-album-action"
                        onClick={(e) => {
                          e.preventDefault();
                          openEditModal(album);
                        }}
                      >
                        Upraviť
                      </button>
                      <button
                        className="gallery-album-action danger"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteAlbum(album.id, album.title);
                        }}
                      >
                        Zmazať
                      </button>
                    </div>
                  )}
                </div>
                <div className="gallery-album-info">
                  <h3 className="gallery-album-title">{album.title}</h3>
                  <p className="gallery-album-date">
                    {formatDate(album.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateAlbumModal
        open={showCreateModal}
        groups={groups}
        backendUrl={BACKEND_URL}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchAlbums}
      />
      <EditAlbumModal
        album={editAlbum}
        groups={groups}
        backendUrl={BACKEND_URL}
        onClose={() => setEditAlbum(null)}
        onUpdated={fetchAlbums}
      />
    </>
  );
}

function normalizePhotoUrl(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.startsWith("http")) return normalized;
  return `${BACKEND_URL}/${normalized.replace(/^\/+/, "")}`;
}
