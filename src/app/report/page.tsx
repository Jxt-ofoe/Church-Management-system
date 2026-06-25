"use client";

import { useState, useEffect } from "react";
import { CHURCH_NAME } from "@/lib/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faClipboardList, faChartLine } from "@fortawesome/free-solid-svg-icons";


interface AbsentMember {
  memberId: number;
  memberName: string;
}

interface Offering {
  id: number;
  serviceId: number;
  type: string;
  amount: number;
  toward: string | null;
  note: string | null;
}

interface ServiceReport {
  id: number;
  date: string;
  label: string | null;
  headcount: number;
  absentMembers: AbsentMember[];
  offerings: Offering[];
}

interface ReportData {
  month: string;
  year: string;
  services: ServiceReport[];
  totals: {
    general: number;
    seed: number;
    partnershipByToward: Record<string, number>;
    totalPartnership: number;
    totalAll: number;
  };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ReportPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState((currentDate.getMonth() + 1).toString());
  const [year, setYear] = useState(currentDate.getFullYear().toString());
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) =>
    (currentDate.getFullYear() - 5 + i).toString()
  );

  const fetchReport = async () => {
    setLoading(true);
    setFetched(true);
    try {
      const res = await fetch(
        `/api/report?month=${month.padStart(2, "0")}&year=${year}`
      );
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetched) {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="slide-up">
      {/* Print Header (hidden on screen, shown in print) */}
      <div className="print-header hidden">
        <h1>{CHURCH_NAME}</h1>
        <p>
          Monthly Report — {MONTHS[parseInt(month) - 1]} {year}
        </p>
      </div>

      <div className="flex items-center justify-between mb-8 no-print">
        <div>
          <h1 className="page-title">Monthly Report</h1>
          <p className="page-subtitle">
            Generate and print detailed monthly service reports
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card mb-8 no-print">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input-field"
              style={{ minWidth: '180px' }}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={(i + 1).toString()} style={{ background: '#1e293b', color: '#f1f5f9' }}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="input-field"
              style={{ minWidth: '120px' }}
            >
              {years.map((y) => (
                <option key={y} value={y} style={{ background: '#1e293b', color: '#f1f5f9' }}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button onClick={fetchReport} className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Loading...
              </span>
            ) : (
              "Generate Report"
            )}
          </button>

          {report && report.services.length > 0 && (
            <button onClick={() => window.print()} className="btn-secondary ml-auto flex items-center gap-2">
              <FontAwesomeIcon icon={faPrint} className="w-3.5 h-3.5" />
              Print Report
            </button>
          )}
        </div>
      </div>

      {/* Report Content */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && report && (
        <div className="report-content space-y-6">
          {report.services.length === 0 ? (
            <div className="glass-card text-center py-16 flex flex-col items-center justify-center">
              <FontAwesomeIcon icon={faClipboardList} className="text-4xl mb-4 text-slate-600" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No services found for {MONTHS[parseInt(month) - 1]} {year}.
              </p>
            </div>
          ) : (
            <>
              {/* Individual Services */}
              {report.services.map((service) => {
                const generalOfferings = service.offerings.filter((o) => o.type === "general");
                const seedOfferings = service.offerings.filter((o) => o.type === "seed");
                const partnershipOfferings = service.offerings.filter((o) => o.type === "partnership");

                return (
                  <div key={service.id} className="glass-card service-block">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {formatDate(service.date)}
                        </h3>
                        <span className="badge badge-purple mt-1">
                          {service.label || "Service"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{service.headcount}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Headcount
                        </p>
                      </div>
                    </div>

                    {/* Absent Members */}
                    {service.absentMembers.length > 0 && (
                      <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#f87171' }}>
                          Absent ({service.absentMembers.length})
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {service.absentMembers.map((a) => a.memberName).join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Offerings Breakdown */}
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Details</th>
                            <th className="text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generalOfferings.map((o) => (
                            <tr key={o.id}>
                              <td><span className="badge badge-green">General</span></td>
                              <td>—</td>
                              <td className="text-right font-mono font-medium text-white">
                                {formatCurrency(o.amount)}
                              </td>
                            </tr>
                          ))}
                          {seedOfferings.map((o) => (
                            <tr key={o.id}>
                              <td><span className="badge badge-blue">Seed</span></td>
                              <td>—</td>
                              <td className="text-right font-mono font-medium text-white">
                                {formatCurrency(o.amount)}
                              </td>
                            </tr>
                          ))}
                          {partnershipOfferings.map((o) => (
                            <tr key={o.id}>
                              <td><span className="badge badge-purple">Partnership</span></td>
                              <td style={{ color: 'var(--text-secondary)' }}>{o.toward || "—"}</td>
                              <td className="text-right font-mono font-medium text-white">
                                {formatCurrency(o.amount)}
                              </td>
                            </tr>
                          ))}
                          {service.offerings.length === 0 && (
                            <tr>
                              <td colSpan={3} className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                                No offerings recorded
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {/* Monthly Totals */}
              <div className="glass-card totals-section" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
                <h3 className="text-lg font-semibold text-white mb-6">
                  Monthly Totals — {MONTHS[parseInt(month) - 1]} {year}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#34d399' }}>
                      General
                    </p>
                    <p className="text-2xl font-bold text-white font-mono">
                      {formatCurrency(report.totals.general)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#60a5fa' }}>
                      Seed
                    </p>
                    <p className="text-2xl font-bold text-white font-mono">
                      {formatCurrency(report.totals.seed)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#a78bfa' }}>
                      Partnership
                    </p>
                    <p className="text-2xl font-bold text-white font-mono">
                      {formatCurrency(report.totals.totalPartnership)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.08))', border: '1px solid rgba(139,92,246,0.25)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#c4b5fd' }}>
                      Total All
                    </p>
                    <p className="text-2xl font-bold text-white font-mono">
                      {formatCurrency(report.totals.totalAll)}
                    </p>
                  </div>
                </div>

                {/* Partnership breakdown by "toward" */}
                {Object.keys(report.totals.partnershipByToward).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: 'var(--text-muted)' }}>
                      Partnership Breakdown
                    </p>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Toward</th>
                          <th className="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(report.totals.partnershipByToward).map(
                          ([toward, amount]) => (
                            <tr key={toward}>
                              <td className="font-medium text-white">{toward}</td>
                              <td className="text-right font-mono font-medium text-white">
                                {formatCurrency(amount)}
                              </td>
                            </tr>
                          )
                        )}
                        <tr>
                          <td className="font-semibold text-white">Grand Total</td>
                          <td className="text-right font-mono font-bold text-white">
                            {formatCurrency(report.totals.totalPartnership)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {!loading && !report && !fetched && (
        <div className="glass-card text-center py-16 flex flex-col items-center justify-center">
          <FontAwesomeIcon icon={faChartLine} className="text-4xl mb-4 text-slate-600" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Select a month and year, then click &quot;Generate Report&quot; to view the data.
          </p>
        </div>
      )}
    </div>
  );
}
