"use client";

import { FormEvent, useEffect, useState } from "react";
import { Panel, Shell, useSession } from "@/components/Shell";
import { PageSkeleton } from "@/components/Skeleton";
import { api } from "@/lib/api";

type Profile = {
  id: number;
  code: string;
  realName: string;
  name: string;
  publicName: string;
  slogan: string;
  bio: string;
  actionsRaw: string;
  avatarUrl: string;
  coverUrl: string;
  portfolio: { id: number; imageUrl: string; caption: string }[];
};

type Listed = { id: number; code: string; name: string; realName?: string };

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function ProfileStudioPage() {
  const user = useSession();
  const canPick = user?.role === "admin" || user?.role === "manager";
  const [list, setList] = useState<Listed[]>([]);
  const [barberId, setBarberId] = useState<number | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [publicName, setPublicName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [bio, setBio] = useState("");
  const [actions, setActions] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadProfile(id?: number | null) {
    const q = id ? `?barberId=${id}` : "";
    const data = await api<Profile>(`/api/profile${q}`);
    setProfile(data);
    setBarberId(data.id);
    setPublicName(data.publicName || "");
    setSlogan(data.slogan);
    setBio(data.bio);
    setActions(data.actionsRaw);
  }

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        if (canPick) {
          const rows = await api<Listed[]>("/api/profiles");
          setList(rows);
          const first = rows[0]?.id || null;
          setBarberId(first);
          if (first) await loadProfile(first);
        } else {
          await loadProfile();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, canPick]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          barberId,
          publicName,
          slogan,
          bio,
          actions,
        }),
      });
      setMessage("Profile saved.");
      await loadProfile(barberId);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onAvatar(file?: File | null) {
    if (!file || !barberId) return;
    setBusy(true);
    try {
      const avatarDataUrl = await readFileAsDataUrl(file);
      await api("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ barberId, avatarDataUrl }),
      });
      await loadProfile(barberId);
      setMessage("Portrait updated.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onCover(file?: File | null) {
    if (!file || !barberId) return;
    setBusy(true);
    try {
      const coverDataUrl = await readFileAsDataUrl(file);
      await api("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ barberId, coverDataUrl }),
      });
      await loadProfile(barberId);
      setMessage("Cover updated.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function addWork(file?: File | null) {
    if (!file || !barberId) return;
    setBusy(true);
    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      await api("/api/portfolio", {
        method: "POST",
        body: JSON.stringify({ barberId, caption, imageDataUrl }),
      });
      setCaption("");
      await loadProfile(barberId);
      setMessage("Work photo added.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeWork(id: number) {
    setBusy(true);
    try {
      await api(`/api/portfolio/${id}`, { method: "DELETE" });
      await loadProfile(barberId);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell loading={loading && !error}>
      <Panel title="Public profile studio" className="manager-card">
        <p style={{ color: "var(--barbazza-stone)", marginTop: 0 }}>
          Public name, slogan, bio, portrait, cover, and work gallery — visible on the booking site. Real staff name stays private and cannot be changed here.
        </p>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {canPick ? (
          <div className="form-group">
            <label className="form-label">Barber</label>
            <select
              value={barberId || ""}
              onChange={async (e) => {
                const id = Number(e.target.value);
                setBarberId(id);
                setLoading(true);
                try {
                  await loadProfile(id);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {list.map((row) => (
                <option key={row.id} value={row.id}>
                  {(row.realName || row.name) + ` · public: ${row.name}`} ({row.code})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {!profile ? (
          <PageSkeleton cards={1} kpis={0} />
        ) : (
          <>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, marginBottom: 6 }}>Portrait</div>
                <div style={{ width: 96, height: 96, borderRadius: "50%", background: `url(${profile.avatarUrl}) center/cover`, filter: "grayscale(1)" }} />
                <input type="file" accept="image/*" onChange={(e) => onAvatar(e.target.files?.[0])} disabled={busy} />
              </div>
              <div>
                <div style={{ fontSize: 12, marginBottom: 6 }}>Cover</div>
                <div style={{ height: 96, background: `url(${profile.coverUrl}) center/cover`, filter: "grayscale(1)" }} />
                <input type="file" accept="image/*" onChange={(e) => onCover(e.target.files?.[0])} disabled={busy} />
              </div>
            </div>

            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label className="form-label">Real name (staff record — locked)</label>
                <input value={profile.realName} disabled readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Public name (shown to clients)</label>
                <input
                  value={publicName}
                  onChange={(e) => setPublicName(e.target.value)}
                  maxLength={120}
                  placeholder="Stage / chair name clients will see"
                />
                <small style={{ color: "var(--barbazza-stone)" }}>
                  Clients only see this name. Leave blank to temporarily show the real name until you set one.
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">Slogan</label>
                <input value={slogan} onChange={(e) => setSlogan(e.target.value)} maxLength={200} placeholder="One line that defines the chair" />
              </div>
              <div className="form-group">
                <label className="form-label">Actions / crafts (comma separated)</label>
                <input value={actions} onChange={(e) => setActions(e.target.value)} placeholder="Fades, Beard sculpt, Hot towel" />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Tell clients who you are in the chair" />
              </div>
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? "Saving…" : "Save profile"}
              </button>
            </form>

            <hr style={{ margin: "1.5rem 0", borderColor: "var(--barbazza-graphite)" }} />
            <h3 style={{ marginTop: 0 }}>Work gallery</h3>
            <div className="form-group">
              <label className="form-label">Caption</label>
              <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption" />
            </div>
            <input type="file" accept="image/*" onChange={(e) => addWork(e.target.files?.[0])} disabled={busy} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginTop: 14 }}>
              {profile.portfolio.map((item) => (
                <div key={item.id} style={{ border: "1px solid var(--barbazza-graphite)" }}>
                  <div style={{ height: 100, background: `url(${item.imageUrl}) center/cover`, filter: "grayscale(1)" }} />
                  <div style={{ padding: 8, fontSize: 12 }}>
                    {item.caption || "Work"}
                    <button type="button" className="btn-primary" style={{ display: "block", marginTop: 6, minHeight: 32 }} onClick={() => removeWork(item.id)} disabled={busy}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {message ? <p>{message}</p> : null}
          </>
        )}
      </Panel>
    </Shell>
  );
}
