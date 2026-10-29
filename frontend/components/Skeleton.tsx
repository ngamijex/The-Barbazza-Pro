"use client";

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skel ${className}`} style={style} aria-hidden />;
}

export function PageSkeleton({ cards = 3, kpis = 4 }: { cards?: number; kpis?: number }) {
  return (
    <div className="skel-page" aria-busy="true" aria-label="Loading">
      <div className="skel-kpis">
        {Array.from({ length: kpis }).map((_, i) => (
          <div key={i} className="skel-kpi">
            <Skeleton style={{ height: 10, width: "55%", margin: "0 auto 10px" }} />
            <Skeleton style={{ height: 22, width: "70%", margin: "0 auto" }} />
          </div>
        ))}
      </div>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="skel-card">
          <Skeleton style={{ height: 18, width: "42%", marginBottom: 16 }} />
          <Skeleton style={{ height: 12, width: "100%", marginBottom: 10 }} />
          <Skeleton style={{ height: 12, width: "92%", marginBottom: 10 }} />
          <Skeleton style={{ height: 12, width: "78%", marginBottom: 10 }} />
          <Skeleton style={{ height: 120, width: "100%", marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="skel-card" aria-busy="true">
      <Skeleton style={{ height: 18, width: "36%", marginBottom: 16 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} style={{ height: 36, width: "100%", marginBottom: 8 }} />
      ))}
    </div>
  );
}

export function AppBootSkeleton() {
  return (
    <div className="app-shell-boot" aria-busy="true" aria-label="Loading Barbazza">
      <div className="skel-header">
        <Skeleton style={{ height: 40, width: 40, borderRadius: 8 }} />
        <Skeleton style={{ height: 22, width: 120 }} />
        <div style={{ flex: 1 }} />
        <Skeleton style={{ height: 32, width: 72, borderRadius: 6 }} />
      </div>
      <div className="skel-tabs">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} style={{ height: 14, width: 72 }} />
        ))}
      </div>
      <div className="app-content">
        <PageSkeleton />
      </div>
      <div className="skel-bottom-nav md-hide-skel">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skel-bottom-item">
            <Skeleton style={{ height: 22, width: 22, borderRadius: 6, margin: "0 auto 6px" }} />
            <Skeleton style={{ height: 8, width: 40, margin: "0 auto" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
