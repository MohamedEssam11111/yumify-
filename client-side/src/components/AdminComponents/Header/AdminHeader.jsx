import { Bell, CalendarDays, Moon, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import getImageUrl from "../../../../utils/getImageUrl";
const AdminHeader = ({ adminProfile }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header
      className="
      sticky top-0 z-50
      backdrop-blur-xl
      bg-[#050816]/80
      border-b border-white/10
      "
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-24 flex items-center justify-between gap-8">
        {/* ---------------- Left ---------------- */}

        <div className="flex flex-col">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Yumify{" "}
            <span className="text-[#FF901C] drop-shadow-[0_0_12px_rgba(255,144,28,.55)]">
              Admin
            </span>
          </h1>

          <p className="text-sm text-[#AAB3D3] mt-1">Platform Control Center</p>
        </div>

        {/* ---------------- Right ---------------- */}

        <div className="flex items-center gap-4">
          {/* Profile */}

          <div
            className="
            flex
            items-center
            gap-3
            rounded-2xl
            bg-[#0B1024]
            border
            border-white/10
            px-3
            py-2
            hover:border-[#FF901C]
            transition
            duration-300
            "
            onClick={() => {
              navigate("/profile");
            }}
          >
            <img
              src={getImageUrl(adminProfile.image, "users") || "/default.webp"}
              alt={adminProfile.name}
              className="
              w-12
              h-12
              rounded-xl
              object-cover
              border
              border-[#7C5CFF]/50
              "
            />

            <div className="hidden md:block">
              <h3 className="text-white font-semibold leading-none">
                {adminProfile.name}
              </h3>

              <div className="flex items-center gap-1 mt-1">
                <ShieldCheck size={14} className="text-[#22C55E]" />

                <span className="text-xs text-[#AAB3D3]">
                  {adminProfile.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
