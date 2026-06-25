"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";


interface Member {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  dob: string | null;
  createdAt: string | null;
}


export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          dob: dob || null,
        }),
      });
      if (res.ok) {
        setName("");
        setPhone("");
        setEmail("");
        setDob("");
        await fetchMembers();
      }
    } catch (err) {
      console.error("Failed to add member:", err);
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (id: number, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName}?`)) return;

    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchMembers();
      }
    } catch (err) {
      console.error("Failed to delete member:", err);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDOB = (dobStr: string | null) => {
    if (!dobStr) return "—";
    return new Date(dobStr + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBirthdaysThisMonth = () => {
    const currentMonth = new Date().getMonth() + 1; // 1-indexed (1-12)
    return members.filter((member) => {
      if (!member.dob) return false;
      const birthMonth = parseInt(member.dob.split("-")[1], 10);
      return birthMonth === currentMonth;
    }).sort((a, b) => {
      const dayA = parseInt(a.dob!.split("-")[2], 10);
      const dayB = parseInt(b.dob!.split("-")[2], 10);
      return dayA - dayB;
    });
  };

  const birthdaysThisMonth = getBirthdaysThisMonth();

  return (
    <div className="slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">
            Manage your church members • {members.length} total
          </p>
        </div>
      </div>

      {/* Add Member Form */}
      <div className="glass-card mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--text-muted)' }}>
          Add New Member
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving || !name.trim()} className="btn-primary whitespace-nowrap flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Adding...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
                  Add Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Members list & Birthdays layout */}
      {loading ? (
        <div className="glass-card flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="glass-card text-center py-16 flex flex-col items-center justify-center">
          <FontAwesomeIcon icon={faUsers} className="text-4xl mb-4 text-slate-600" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No members yet. Add your first member above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className={birthdaysThisMonth.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
            <div className="glass-card p-0 overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Date of Birth</th>
                    <th>Date Added</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, i) => (
                    <tr key={member.id} className="slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        {i + 1}
                      </td>
                      <td className="font-medium text-white">{member.name}</td>
                      <td>{member.phone || "—"}</td>
                      <td>{member.email || "—"}</td>
                      <td>{formatDOB(member.dob)}</td>
                      <td>{formatDate(member.createdAt)}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
                          className="btn-danger text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 ml-auto"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {birthdaysThisMonth.length > 0 && (
            <div className="lg:col-span-1 slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="glass-card" style={{ borderColor: 'rgba(236, 72, 153, 0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🎂</span>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                    {new Date().toLocaleString("default", { month: "long" })} Birthdays
                  </h3>
                </div>
                <ul className="space-y-3">
                  {birthdaysThisMonth.map((member) => {
                    const day = parseInt(member.dob!.split("-")[2], 10);
                    const monthName = new Date(member.dob! + "T00:00:00").toLocaleString("default", { month: "short" });
                    return (
                      <li key={member.id} className="flex justify-between items-center py-2.5 border-b border-white/[0.04] last:border-0">
                        <div className="min-w-0 pr-2">
                          <p className="text-sm font-medium text-white truncate">{member.name}</p>
                          {member.phone && (
                            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                              📞 {member.phone}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold shrink-0 font-mono"
                          style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                          {monthName} {day}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

