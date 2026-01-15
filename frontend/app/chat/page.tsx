"use client";

import Header from "@/app/components/Header";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000";

type Me = { id: number } | null;

type Conversation = {
    partnerId: number;
    partnerName: string;
    lastMessage: string;
    lastAt: string;
    unreadCount: number;
};

type ThreadMsg = {
    id: number;
    senderId: number;
    recipientId: number;
    value: string;
    createdAt: string;
    readAt: string | null;

    isAttachment: boolean;
    attachmentName: string | null;
    attachmentMime: string | null;
    attachmentSize: number | null;
};

type UserPick = { id: number; name: string; email: string };

type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false; error?: string };
type ApiResponse<T> = ApiOk<T> | ApiErr;

type AuthMeResponse = {
    user: { id: number; email?: string; role?: string } | null;
    error?: string;
};

function isRecord(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null;
}

function getErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    return "Nastala neočakávaná chyba.";
}

function parseApiResponse<T>(json: unknown): ApiResponse<T> {
    if (!isRecord(json)) return { success: false, error: "Invalid response" };

    const success = json["success"];
    if (success === true) return { success: true, data: json["data"] as T };

    if (success === false) {
        const errorVal = json["error"];
        return { success: false, error: typeof errorVal === "string" ? errorVal : undefined };
    }

    return { success: false, error: "Invalid response" };
}

function parseAuthMe(json: unknown): AuthMeResponse {
    if (!isRecord(json)) return { user: null, error: "Invalid response" };
    const userVal = json["user"];

    if (userVal === null) {
        const err = json["error"];
        return { user: null, error: typeof err === "string" ? err : undefined };
    }

    if (isRecord(userVal)) {
        const idVal = userVal["id"];
        if (typeof idVal === "number") {
            const emailVal = userVal["email"];
            const roleVal = userVal["role"];
            return {
                user: {
                    id: idVal,
                    email: typeof emailVal === "string" ? emailVal : undefined,
                    role: typeof roleVal === "string" ? roleVal : undefined,
                },
            };
        }
    }

    return { user: null, error: "Invalid user payload" };
}

const fmtDateTime = (iso: string) =>
    new Intl.DateTimeFormat("sk-SK", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));

function toDownloadUrl(pathOrUrl: string): string {
    const p = pathOrUrl.trim();
    if (!p) return "#";
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    if (p.startsWith("/")) return `${API_BASE}${p}`;
    return `${API_BASE}/${p}`;
}



export default function ChatPage() {
    const [me, setMe] = useState<Me>(null);
    const [convos, setConvos] = useState<Conversation[]>([]);
    const [activePartnerId, setActivePartnerId] = useState<number | null>(null);
    const [thread, setThread] = useState<ThreadMsg[]>([]);
    const [err, setErr] = useState<string | null>(null);

    const [draft, setDraft] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);


    const [newOpen, setNewOpen] = useState(false);
    const [userQ, setUserQ] = useState("");
    const [userHits, setUserHits] = useState<UserPick[]>([]);
    const [userLoading, setUserLoading] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    const [selectedUsers, setSelectedUsers] = useState<UserPick[]>([]);
    const [bulkText, setBulkText] = useState("");

    const qTrim = userQ.trim();
    const showDropdown = userOpen && qTrim.length >= 2 && (userLoading || userHits.length > 0);

    const threadRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const activePartner = useMemo(
        () => convos.find((c) => c.partnerId === activePartnerId) ?? null,
        [convos, activePartnerId]
    );
    async function deleteConversation(partnerId: number) {
        if (!window.confirm("Naozaj chceš vymazať túto konverzáciu?")) return;

        const res = await fetch(`${API_BASE}/api/chat/conversation/${partnerId}`, {
            method: "DELETE",
            credentials: "include",
        });

        const raw: unknown = await res.json().catch(() => null);
        const parsed = parseApiResponse<unknown>(raw);

        if (!res.ok || parsed.success === false) {
            throw new Error(parsed.success === false ? parsed.error ?? "Delete failed" : "Delete failed");
        }


        await fetchConversations();


        setThread((prev) => (activePartnerId === partnerId ? [] : prev));
        setActivePartnerId((prev) => (prev === partnerId ? null : prev));
    }



    async function fetchMe() {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include", cache: "no-store" });
        const raw: unknown = await res.json().catch(() => null);
        const parsed = parseAuthMe(raw);

        const myId = parsed.user?.id ?? null;
        setMe(myId ? { id: myId } : null);

        if (!res.ok && parsed.error) throw new Error(parsed.error);
        return myId;
    }

    async function fetchConversations() {
        const res = await fetch(`${API_BASE}/api/chat/conversations`, { credentials: "include" });
        const raw: unknown = await res.json();
        const parsed = parseApiResponse<unknown>(raw);

        if (!res.ok || parsed.success === false) {
            throw new Error(parsed.success === false ? parsed.error ?? "Fetch failed" : "Fetch failed");
        }

        if (!Array.isArray(parsed.data)) {
            setConvos([]);
            return;
        }

        const safe: Conversation[] = parsed.data
            .map((x) => (isRecord(x) ? x : null))
            .filter((x): x is Record<string, unknown> => x !== null)
            .map((x) => ({
                partnerId: typeof x["partnerId"] === "number" ? x["partnerId"] : -1,
                partnerName: typeof x["partnerName"] === "string" ? x["partnerName"] : "",
                lastMessage: typeof x["lastMessage"] === "string" ? x["lastMessage"] : "",
                lastAt: typeof x["lastAt"] === "string" ? x["lastAt"] : String(x["lastAt"] ?? ""),
                unreadCount: typeof x["unreadCount"] === "number" ? x["unreadCount"] : 0,
            }))
            .filter((c) => c.partnerId !== -1);

        setConvos(safe);
    }

    async function openThread(partnerId: number) {
        setActivePartnerId(partnerId);

        const res = await fetch(`${API_BASE}/api/chat/thread/${partnerId}`, { credentials: "include" });
        const raw: unknown = await res.json();
        const parsed = parseApiResponse<unknown>(raw);

        if (!res.ok || parsed.success === false) {
            throw new Error(parsed.success === false ? parsed.error ?? "Fetch failed" : "Fetch failed");
        }

        if (!Array.isArray(parsed.data)) {
            setThread([]);
            return;
        }

        const safe: ThreadMsg[] = parsed.data
            .map((x) => (isRecord(x) ? x : null))
            .filter((x): x is Record<string, unknown> => x !== null)
            .map((x) => ({
                id: typeof x["id"] === "number" ? x["id"] : -1,
                senderId: typeof x["senderId"] === "number" ? x["senderId"] : -1,
                recipientId: typeof x["recipientId"] === "number" ? x["recipientId"] : -1,
                value: typeof x["value"] === "string" ? x["value"] : "",
                createdAt: typeof x["createdAt"] === "string" ? x["createdAt"] : String(x["createdAt"] ?? ""),
                readAt: typeof x["readAt"] === "string" ? x["readAt"] : null,

                isAttachment: typeof x["isAttachment"] === "boolean" ? x["isAttachment"] : false,
                attachmentName: typeof x["attachmentName"] === "string" ? x["attachmentName"] : null,
                attachmentMime: typeof x["attachmentMime"] === "string" ? x["attachmentMime"] : null,
                attachmentSize: typeof x["attachmentSize"] === "number" ? x["attachmentSize"] : null,
            }))
            .filter((m) => m.id !== -1);

        setThread(safe);

        fetch(`${API_BASE}/api/chat/mark-read/${partnerId}`, {
            method: "POST",
            credentials: "include",
        }).catch(() => {});

        fetchConversations().catch(() => {});
    }

    function addSelected(u: UserPick) {
        setSelectedUsers((prev) => (prev.some((x) => x.id === u.id) ? prev : [...prev, u]));
    }

    function removeSelected(id: number) {
        setSelectedUsers((prev) => prev.filter((x) => x.id !== id));
    }

    async function sendBulk() {
        const text = bulkText.trim();
        if (!text || selectedUsers.length === 0) return;

        const recipientIds = selectedUsers.map((u) => u.id);

        const res = await fetch(`${API_BASE}/api/chat/send-bulk`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipientIds, value: text }),
        });

        const raw: unknown = await res.json();
        const parsed = parseApiResponse<{ sentTo: number }>(raw);

        if (!res.ok || parsed.success === false) {
            throw new Error(parsed.success === false ? parsed.error ?? "Failed" : "Failed");
        }

        setNewOpen(false);
        setSelectedUsers([]);
        setBulkText("");
        setUserQ("");
        setUserHits([]);
        setUserOpen(false);

        await fetchConversations();
    }

    async function sendMessage(e?: FormEvent) {
  if (e) e.preventDefault();

  const partnerId = activePartnerId;
  const myId = me?.id ?? null;
  if (!partnerId || !myId) return;

  const text = draft.trim();

  
  const pickedFile = fileInputRef.current?.files?.[0] ?? null;
  const hasFile = pickedFile != null;

  
  if (!hasFile && !text) return;

  
  const optimistic: ThreadMsg = {
    id: -Date.now(),
    senderId: myId,
    recipientId: partnerId,
    value: hasFile ? (pickedFile?.name ?? "Príloha") : text,
    createdAt: new Date().toISOString(),
    readAt: null,
    isAttachment: hasFile,
    attachmentName: hasFile ? (pickedFile?.name ?? null) : null,
    attachmentMime: hasFile ? (pickedFile?.type || null) : null,
    attachmentSize: hasFile ? (pickedFile?.size ?? null) : null,
  };

  setThread((prev) => [...prev, optimistic]);

  
  setDraft("");
  setFile(null);
  if (fileInputRef.current) fileInputRef.current.value = "";

  try {
    let res: Response;

    if (hasFile) {
      const fd = new FormData();
      fd.append("recipientId", String(partnerId));

      
      if (text) fd.append("value", text);

    
      fd.append("file", pickedFile);

      res = await fetch(`${API_BASE}/api/chat/send`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
    } else {
      res = await fetch(`${API_BASE}/api/chat/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: partnerId, value: text }),
      });
    }

    const raw: unknown = await res.json();
    const parsed = parseApiResponse<unknown>(raw);

    if (!res.ok || parsed.success === false) {
      throw new Error(parsed.success === false ? parsed.error ?? "Failed to send" : "Failed to send");
    }

    await openThread(partnerId);
    await fetchConversations();
  } catch (errx) {
    setErr(getErrorMessage(errx));
    setThread((prev) => prev.filter((m) => m.id !== optimistic.id));

    
    if (!hasFile) setDraft(text);
  }
}


    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setErr(null);
                await fetchMe();
                if (!alive) return;

                await fetchConversations();
                if (!alive) return;
            } catch (e) {
                if (alive) setErr(getErrorMessage(e));
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        if (activePartnerId == null && convos.length > 0) {
            openThread(convos[0].partnerId).catch((e) => setErr(getErrorMessage(e)));
        }

    }, [convos]);

    useEffect(() => {
        const el = threadRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [thread]);


    useEffect(() => {
        if (!newOpen) return;

        const q = userQ.trim();
        if (q.length < 2) {
            setUserHits([]);
            setUserLoading(false);
            return;
        }

        const t = window.setTimeout(async () => {
            try {
                setUserLoading(true);

                const res = await fetch(`${API_BASE}/api/chat/users?q=${encodeURIComponent(q)}`, {
                    credentials: "include",
                });

                const raw: unknown = await res.json();
                const parsed = parseApiResponse<unknown>(raw);

                if (!res.ok || parsed.success === false) {
                    throw new Error(parsed.success === false ? parsed.error ?? "Fetch failed" : "Fetch failed");
                }

                if (!Array.isArray(parsed.data)) {
                    setUserHits([]);
                    return;
                }

                const safe: UserPick[] = parsed.data
                    .map((x) => (isRecord(x) ? x : null))
                    .filter((x): x is Record<string, unknown> => x !== null)
                    .map((x) => ({
                        id: typeof x["id"] === "number" ? x["id"] : -1,
                        name: typeof x["name"] === "string" ? x["name"] : "",
                        email: typeof x["email"] === "string" ? x["email"] : "",
                    }))
                    .filter((u) => u.id !== -1)
                    .filter((u) => (me?.id != null ? u.id !== me.id : true));

                setUserHits(safe);
            } catch (e) {
                setErr(getErrorMessage(e));
            } finally {
                setUserLoading(false);
            }
        }, 250);

        return () => window.clearTimeout(t);

    }, [newOpen, userQ, me?.id]);

    function closeModal() {
        setNewOpen(false);
        setUserQ("");
        setUserHits([]);
        setUserLoading(false);
        setSelectedUsers([]);
        setBulkText("");
        setUserOpen(false);
    }

    return (
        <>
            <Header />

            <div className="govuk-main-wrapper govuk-width-container idsk-docs">
                <div className="idsk-docs__wrap">
                    <span className="idsk-docs__divider" aria-hidden="true"></span>

                    <div className="idsk-docs__row">
                        <aside className="idsk-docs__sidenav chatPeoplePanel" aria-label="Konverzácie">
                            <div className="chatLeftHeader">
                                <button
                                    type="button"
                                    className="govuk-button govuk-button--secondary chatNewBtn"
                                    onClick={() => setNewOpen(true)}
                                >
                                    Nová správa
                                </button>
                            </div>

                            {err && (
                                <div className="govuk-error-summary" role="alert">
                                    <h2 className="govuk-error-summary__title">Nastala chyba</h2>
                                    <div className="govuk-error-summary__body">
                                        <p className="govuk-body">{err}</p>
                                    </div>
                                </div>
                            )}

                            <ul className="govuk-list convoList">
                                {convos.map((c) => {
                                    const active = c.partnerId === activePartnerId;
                                    return (
                                        <li
                                            key={c.partnerId}
                                            className={`convoItem ${active ? "convoItemActive" : ""}`}
                                            onClick={() => openThread(c.partnerId).catch((e) => setErr(getErrorMessage(e)))}
                                        >
                                            <div className="convoHeader">
                                                <div className="convoName" title={c.partnerName}>
                                                    {c.partnerName}
                                                </div>
                                            </div>

                                            <div className="convoSubRow">
                                                <div className="convoLastMsg">{c.lastMessage}</div>
                                                {c.unreadCount > 0 && <div className="unreadBadge">{c.unreadCount}</div>}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </aside>

                        <main className="idsk-docs__main chatMainPanel">
                            <div className="threadHeader">
                                <div className="threadTitle" title={activePartner?.partnerName ?? ""}>
                                    {activePartner ? activePartner.partnerName : "—"}
                                </div>
                            </div>

                            <div className="threadWrap">
                                <div ref={threadRef} className="threadBox">
                                    {thread.map((m) => {
                                        const mine = me?.id != null && m.senderId === me.id;

                                        return (
                                            <div key={m.id} className={`msgRow ${mine ? "msgRowMine" : "msgRowOther"}`}>
                                                <div className={`bubble ${mine ? "bubbleMine" : ""}`}>

                                                    {!m.isAttachment ? (
                                                        <div className="bubbleText">{m.value}</div>
                                                    ) : (
                                                        <div className="bubbleAttachment">
                                                            <div className="bubbleAttachmentTitle">
                                                                Príloha: <b>{m.attachmentName ?? "Súbor"}</b>
                                                            </div>

                                                            <a
                                                                className="bubbleAttachmentLink"
                                                                href={toDownloadUrl(m.value)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                Stiahnuť
                                                            </a>

                                                            {typeof m.attachmentSize === "number" && (
                                                                <div className="bubbleAttachmentMeta">
                                                                    {Math.round(m.attachmentSize / 1024)} KB
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="bubbleMeta">{fmtDateTime(m.createdAt)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>


                                <form className="composer" onSubmit={sendMessage}>
                                    <textarea
                                        className="composerInput"
                                        placeholder="Napíš správu…"
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        rows={2}
                                    />

                                    <div className="composerActions">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="composerFile"
                                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                        />

                                        <button
                                            type="submit"
                                            className="govuk-button composerBtn"
                                            disabled={!activePartnerId || (!draft.trim() && !file)}
                                        >
                                            Odoslať
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </main>
                    </div>
                </div>
            </div>


            {newOpen && (
                <div className="chatModalOverlay" role="dialog" aria-modal="true" onClick={() => closeModal()}>
                    <div className="chatModal" onClick={(e) => e.stopPropagation()}>
                        <div className="chatModalHeader">
                            <div className="chatModalTitle">Nová správa</div>
                            <button type="button" className="govuk-button govuk-button--secondary" onClick={() => closeModal()}>
                                Zavrieť
                            </button>
                        </div>

                        <label className="govuk-label" htmlFor="userSearch">
                            Komu:
                        </label>

                        <input
                            id="userSearch"
                            className="govuk-input"
                            value={userQ}
                            onChange={(e) => setUserQ(e.target.value)}
                            onFocus={() => setUserOpen(true)}
                            onBlur={() => {
                                window.setTimeout(() => setUserOpen(false), 120);
                            }}
                            placeholder="Začni písať meno alebo e-mail…"
                            autoComplete="off"
                        />

                        {selectedUsers.length > 0 && (
                            <div className="chipsRow">
                                {selectedUsers.map((u) => (
                                    <button
                                        key={u.id}
                                        type="button"
                                        className="chip"
                                        onClick={() => removeSelected(u.id)}
                                        title="Odstrániť"
                                    >
                                        {u.name} <span className="chipX">×</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showDropdown && (
                            <div className="userDropdown" role="listbox">
                                {userLoading && <div className="userDropdownEmpty">Načítavam…</div>}

                                {!userLoading &&
                                    userHits.map((u) => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            className="userDropdownItem"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                addSelected(u);
                                                setUserQ("");
                                                setUserHits([]);
                                            }}
                                        >
                                            <div className="userDropdownName">{u.name}</div>
                                            <div className="userDropdownEmail">{u.email}</div>
                                        </button>
                                    ))}

                                {!userLoading && userHits.length === 0 && (
                                    <div className="userDropdownEmpty">Nič sa nenašlo.</div>
                                )}
                            </div>
                        )}

                        <label className="govuk-label" htmlFor="bulkMsg" style={{ marginTop: 12 }}>
                            Správa:
                        </label>

                        <textarea
                            id="bulkMsg"
                            className="composerInput"
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            rows={3}
                            placeholder="Napíš správu, ktorá sa pošle všetkým vybraným…"
                        />

                        <button
                            type="button"
                            className="govuk-button"
                            disabled={selectedUsers.length === 0 || !bulkText.trim()}
                            onClick={() => sendBulk().catch((e) => setErr(getErrorMessage(e)))}
                        >
                            Odoslať všetkým
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
