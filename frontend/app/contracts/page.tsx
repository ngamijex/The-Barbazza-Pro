"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Panel, Shell, useSession } from "@/components/Shell";
import { API } from "@/lib/api";

type ContractType = "recruitment" | "retention";

type FormState = {
  type: ContractType;
  contractDate: string;
  workplace: string;
  commissionPercent: number;
  companyName: string;
  companyTin: string;
  employerName: string;
  employerId: string;
  employerIdPlace: string;
  employerAddress: string;
  employerPhone: string;
  employeeName: string;
  employeeId: string;
  employeeIdPlace: string;
  employeeAddress: string;
  employeePhone: string;
  recruitmentAdvance: number;
  recruitmentBonus: number;
  recruitmentBonusAfterMonths: number;
  monthlyDeduction: number;
  retentionAmount: number;
  commitmentMonths: number;
};

const defaults: FormState = {
  type: "recruitment",
  contractDate: new Date().toISOString().slice(0, 10),
  workplace: "Kigarama / Karugira, Kigali",
  commissionPercent: 40,
  companyName: "THE BARBAZZA BARBERSHOP",
  companyTin: "152991357",
  employerName: "NGAMIJE Didier",
  employerId: "1200280228895062",
  employerIdPlace: "Rubavu / Kanzenze",
  employerAddress: "Akarere ka Kicukiro, Umurenge wa Kigarama",
  employerPhone: "0790 337 027",
  employeeName: "",
  employeeId: "",
  employeeIdPlace: "",
  employeeAddress: "",
  employeePhone: "",
  recruitmentAdvance: 400000,
  recruitmentBonus: 200000,
  recruitmentBonusAfterMonths: 3,
  monthlyDeduction: 25000,
  retentionAmount: 400000,
  commitmentMonths: 12,
};

export default function ContractsPage() {
  const user = useSession();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(defaults);
  const [busy, setBusy] = useState<"filled" | "blank" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") router.replace("/home");
  }, [user, router]);

  const clawback = useMemo(() => Math.round((form.retentionAmount || 0) * 2), [form.retentionAmount]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function download(blank: boolean) {
    setBusy(blank ? "blank" : "filled");
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("barbazza_token") || "";
      const response = await fetch(`${API}/api/contracts/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...form, blank }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Could not generate contract");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match?.[1] || "Barbazza_Amasezerano.docx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage(
        blank
          ? `Downloaded blank template ${filename} (dashed lines to fill by hand).`
          : `Downloaded filled contract ${filename}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate contract");
    } finally {
      setBusy(null);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await download(false);
  }

  return (
    <Shell>
      <Panel title="Employment contracts" className="admin-card">
        <p style={{ marginBottom: "1rem", color: "var(--barbazza-cream)" }}>
          Word contracts match the paper layout: logo cover page, Barbazza header/footer art, and full Kinyarwanda
          articles. Download a           <strong>filled</strong> contract for a new barber, or a <strong>blank dashed template</strong> to print
          and complete by hand outside the system. Both types use recruitment money wording.
        </p>

        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
          <label>Contract type</label>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className={form.type === "recruitment" ? "btn-primary" : "btn-action"}
              onClick={() => set("type", "recruitment")}
            >
              Type A — Recruitment (pay monthly)
            </button>
            <button
              type="button"
              className={form.type === "retention" ? "btn-primary" : "btn-action"}
              onClick={() => set("type", "retention")}
            >
              Type B — Recruitment (stay period / 2× if leave early)
            </button>
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {message ? <div className="alert alert-success">{message}</div> : null}

        <form onSubmit={onSubmit} className="service-form">
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label>Contract date</label>
              <input
                type="date"
                required
                value={form.contractDate}
                onChange={(e) => set("contractDate", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Workplace</label>
              <input required value={form.workplace} onChange={(e) => set("workplace", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Commission %</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={form.commissionPercent}
                onChange={(e) => set("commissionPercent", Number(e.target.value))}
              />
            </div>
          </div>

          <h3 style={{ margin: "1.25rem 0 0.75rem" }}>Company (RDB) & Employer (Umukoresha)</h3>
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label>Registered company name</label>
              <input required value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>TIN</label>
              <input required value={form.companyTin} onChange={(e) => set("companyTin", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Representative full name</label>
              <input required value={form.employerName} onChange={(e) => set("employerName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>National ID</label>
              <input required value={form.employerId} onChange={(e) => set("employerId", e.target.value)} />
            </div>
            <div className="form-group">
              <label>ID issued at</label>
              <input required value={form.employerIdPlace} onChange={(e) => set("employerIdPlace", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input required value={form.employerAddress} onChange={(e) => set("employerAddress", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input required value={form.employerPhone} onChange={(e) => set("employerPhone", e.target.value)} />
            </div>
          </div>

          <h3 style={{ margin: "1.25rem 0 0.75rem" }}>Employee / Barber (Umukozi)</h3>
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label>Full name</label>
              <input required value={form.employeeName} onChange={(e) => set("employeeName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>National ID</label>
              <input required value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} />
            </div>
            <div className="form-group">
              <label>ID issued at</label>
              <input required value={form.employeeIdPlace} onChange={(e) => set("employeeIdPlace", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input required value={form.employeeAddress} onChange={(e) => set("employeeAddress", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input required value={form.employeePhone} onChange={(e) => set("employeePhone", e.target.value)} />
            </div>
          </div>

          {form.type === "recruitment" ? (
            <>
              <h3 style={{ margin: "1.25rem 0 0.75rem" }}>Recruitment money (Ingingo ya 8)</h3>
              <p style={{ color: "var(--barbazza-cream)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                Barber receives recruitment money and pays it back monthly from salary. Leaving early requires paying the
                remaining balance in full.
              </p>
              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label>Advance at start (FRW)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={form.recruitmentAdvance}
                    onChange={(e) => set("recruitmentAdvance", Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Bonus after probation (FRW)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={form.recruitmentBonus}
                    onChange={(e) => set("recruitmentBonus", Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Bonus after (months)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.recruitmentBonusAfterMonths}
                    onChange={(e) => set("recruitmentBonusAfterMonths", Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Monthly deduction (FRW)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={form.monthlyDeduction}
                    onChange={(e) => set("monthlyDeduction", Number(e.target.value))}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 style={{ margin: "1.25rem 0 0.75rem" }}>Recruitment money — stay period (Ingingo ya 8)</h3>
              <p style={{ color: "var(--barbazza-cream)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                Barber receives recruitment money with no monthly repayment, but must stay for the commitment period.
                Leaving early means paying back recruitment money <strong>2×</strong> (RWF {clawback.toLocaleString()}).
              </p>
              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label>Recruitment amount (FRW)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={form.retentionAmount}
                    onChange={(e) => set("retentionAmount", Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Must stay (months)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.commitmentMonths}
                    onChange={(e) => set("commitmentMonths", Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Early-exit clawback (2×)</label>
                  <input readOnly value={clawback} />
                </div>
              </div>
            </>
          )}

          <div
            className="form-group"
            style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}
          >
            <button type="submit" className="btn-primary" disabled={busy !== null}>
              {busy === "filled" ? "Generating…" : "Download filled Word contract"}
            </button>
            <button
              type="button"
              className="btn-action"
              disabled={busy !== null}
              onClick={() => void download(true)}
            >
              {busy === "blank" ? "Generating…" : "Download blank dashed template"}
            </button>
          </div>
          <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--barbazza-cream)" }}>
            Blank template keeps the cover logo and full legal text, with names, IDs, amounts, and dates as{" "}
            <code>________</code> lines for handwriting.
          </p>
        </form>
      </Panel>
    </Shell>
  );
}
