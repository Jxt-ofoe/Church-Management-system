"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChurch, faPlus, faXmark, faTrashCan } from "@fortawesome/free-solid-svg-icons";


interface Member {
  id: number;
  name: string;
}

interface Service {
  id: number;
  date: string;
  label: string | null;
  headcount: number;
  createdAt: string | null;
}

interface Partnership {
  amount: string;
  toward: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [label, setLabel] = useState("Sunday Service");
  const [headcount, setHeadcount] = useState("");
  const [absentIds, setAbsentIds] = useState<Set<number>>(new Set());
  const [generalAmount, setGeneralAmount] = useState("");
  const [seedAmount, setSeedAmount] = useState("");
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [servicesRes, membersRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/members"),
      ]);
      const servicesData = await servicesRes.json();
      const membersData = await membersRes.json();
      setServices(servicesData);
      setMembers(membersData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setLabel("Sunday Service");
    setHeadcount("");
    setAbsentIds(new Set());
    setGeneralAmount("");
    setSeedAmount("");
    setPartnerships([]);
  };

  const toggleAbsent = (id: number) => {
    setAbsentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addPartnership = () => {
    setPartnerships([...partnerships, { amount: "", toward: "" }]);
  };

  const removePartnership = (index: number) => {
    setPartnerships(partnerships.filter((_, i) => i !== index));
  };

  const updatePartnership = (index: number, field: keyof Partnership, value: string) => {
    const updated = [...partnerships];
    updated[index] = { ...updated[index], [field]: value };
    setPartnerships(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        date,
        label,
        headcount: parseInt(headcount),
        absentMemberIds: Array.from(absentIds),
        offerings: {
          general: parseFloat(generalAmount) || 0,
          seed: parseFloat(seedAmount) || 0,
          partnerships: partnerships
            .filter((p) => parseFloat(p.amount) > 0)
            .map((p) => ({
              amount: parseFloat(p.amount),
              toward: p.toward.trim(),
            })),
        },
      };

      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        setShowForm(false);
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to create service:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">
            Record and track church services • {services.length} recorded
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) resetForm();
          }}
          className={`${showForm ? "btn-secondary" : "btn-primary"} flex items-center gap-2`}
        >
          {showForm ? (
            <>
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              Cancel
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
              New Service
            </>
          )}
        </button>
      </div>

      {/* New Service Form */}
      {showForm && (
        <div className="glass-card mb-8 slide-up">
          <h2 className="text-lg font-semibold text-white mb-6">Record New Service</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-muted)' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-muted)' }}>
                  Service Label
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Sunday Service"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-muted)' }}>
                  Headcount
                </label>
                <input
                  type="number"
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
                  placeholder="Total attendees"
                  className="input-field"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Absent Members */}
            {members.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--text-muted)' }}>
                  Mark Absent Members
                  {absentIds.size > 0 && (
                    <span className="badge badge-amber ml-2 normal-case">{absentIds.size} absent</span>
                  )}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                  {members.map((member) => (
                    <label
                      key={member.id}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                        absentIds.has(member.id)
                          ? "bg-red-500/10 border border-red-500/20"
                          : "hover:bg-white/[0.03] border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={absentIds.has(member.id)}
                        onChange={() => toggleAbsent(member.id)}
                        className="custom-checkbox"
                      />
                      <span className={absentIds.has(member.id) ? "text-red-300" : ""} style={!absentIds.has(member.id) ? { color: 'var(--text-secondary)' } : {}}>
                        {member.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Offerings */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--text-muted)' }}>
                Offerings
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* General */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-green">General</span>
                  </div>
                  <input
                    type="number"
                    value={generalAmount}
                    onChange={(e) => setGeneralAmount(e.target.value)}
                    placeholder="Amount"
                    className="input-field"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Seed */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-blue">Seed</span>
                  </div>
                  <input
                    type="number"
                    value={seedAmount}
                    onChange={(e) => setSeedAmount(e.target.value)}
                    placeholder="Amount"
                    className="input-field"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Partnership */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-purple">Partnership</span>
                  <button
                    type="button"
                    onClick={addPartnership}
                    className="text-xs font-medium transition-colors duration-200"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    + Add Entry
                  </button>
                </div>

                {partnerships.length === 0 ? (
                  <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                    No partnership entries. Click &quot;+ Add Entry&quot; to add one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {partnerships.map((p, i) => (
                      <div key={i} className="flex gap-3 items-center slide-up">
                        <input
                          type="number"
                          value={p.amount}
                          onChange={(e) => updatePartnership(i, "amount", e.target.value)}
                          placeholder="Amount"
                          className="input-field flex-1"
                          min="0"
                          step="0.01"
                        />
                        <input
                          type="text"
                          value={p.toward}
                          onChange={(e) => updatePartnership(i, "toward", e.target.value)}
                          placeholder='Toward (e.g. "Building Fund")'
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removePartnership(i)}
                          className="btn-danger text-xs py-2 px-3 shrink-0 flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !date || !headcount}
                className="btn-primary"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Service"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="glass-card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center">
            <FontAwesomeIcon icon={faChurch} className="text-4xl mb-4 text-slate-600" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No services recorded yet. Click &quot;+ New Service&quot; to get started.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Label</th>
                <th>Headcount</th>
                <th>Recorded</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, i) => (
                <tr key={service.id} className="slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td className="font-medium text-white">
                    {formatDate(service.date)}
                  </td>
                  <td>
                    <span className="badge badge-purple">{service.label || "Service"}</span>
                  </td>
                  <td>
                    <span className="font-mono font-medium text-white">
                      {service.headcount}
                    </span>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {service.createdAt
                      ? new Date(service.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
