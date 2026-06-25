import { CHURCH_NAME } from "@/lib/config";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCross,
  faUsers,
  faChurch,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const cards = [
    {
      title: "Members",
      description: "Add, view, and manage church members",
      href: "/members",
      icon: faUsers,
      gradient: "from-violet-500/20 to-purple-500/20",
      border: "border-violet-500/20",
      iconColor: "text-violet-400",
    },
    {
      title: "Services",
      description: "Record services, attendance, and offerings",
      href: "/services",
      icon: faChurch,
      gradient: "from-indigo-500/20 to-blue-500/20",
      border: "border-indigo-500/20",
      iconColor: "text-indigo-400",
    },
    {
      title: "Reports",
      description: "Generate monthly financial and attendance reports",
      href: "/report",
      icon: faClipboardList,
      gradient: "from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-500/20",
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <div className="slide-up">
      {/* Welcome Header */}
      <div className="mb-12 text-center pt-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 text-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15))' }}>
          <FontAwesomeIcon icon={faCross} className="text-violet-400 w-8 h-8" />
        </div>
        <h1 className="page-title text-4xl mb-3">Welcome to {CHURCH_NAME}</h1>
        <p className="page-subtitle text-base max-w-lg mx-auto">
          Your centralized platform for managing members, tracking services, and generating insightful reports
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="group">
            <div className={`glass-card h-full flex flex-col items-center text-center p-8 border ${card.border} group-hover:scale-[1.02] transition-transform duration-300`}>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-2xl mb-5`}>
                <FontAwesomeIcon icon={card.icon} className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">{card.title}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {card.description}
              </p>
              <div className="mt-4 text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                Open →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

