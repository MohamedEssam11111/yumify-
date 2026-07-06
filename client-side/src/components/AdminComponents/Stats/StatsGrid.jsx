import {
  Bot,
  DollarSign,
  Package,
  Star,
  Store,
  Users,
  UserRoundCheck,
  CalendarDays,
} from "lucide-react";

import StatCard from "./StatCard";

const StatsGrid = ({ dashboardStats }) => {
  const stats = [
    {
      title: "Total Users",
      value: dashboardStats.totalUsers,
      growth: "+12.8%",
      icon: Users,
      color: "#4AE8FF",
    },

    {
      title: "Restaurants",
      value: dashboardStats.totalRestaurants,
      growth: "+5.2%",
      icon: Store,
      color: "#FF901C",
    },

    {
      title: "Restaurant Owners",
      value: dashboardStats.totalOwners,
      growth: "+4.1%",
      icon: UserRoundCheck,
      color: "#7C5CFF",
    },

    {
      title: "Orders",
      value: dashboardStats.totalOrders,
      growth: "+14.6%",
      icon: Package,
      color: "#41E9FF",
    },

    {
      title: "Reservations",
      value: dashboardStats.totalReservations,
      growth: "+9.4%",
      icon: CalendarDays,
      color: "#22C55E",
    },

    {
      title: "Revenue",
      value: dashboardStats.totalRevenue,
      growth: "+21.2%",
      icon: DollarSign,
      color: "#FFD166",
    },

    {
      title: "Platform Rating",
      value: dashboardStats.averageRating,
      growth: "+0.3",
      icon: Star,
      color: "#FFB703",
    },

    {
      title: "AI Requests",
      value: dashboardStats.aiRequestsToday,
      growth: "+18%",
      icon: Bot,
      color: "#F72585",
    },
  ];

  return (
    <section className="mt-12">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white">Platform Statistics</h2>

        <p className="mt-2 text-[#AAB3D3]">
          Live overview of the Yumify ecosystem.
        </p>
      </div>

      <div
        className="
        grid
        gap-6

        sm:grid-cols-2

        xl:grid-cols-4
        "
      >
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </section>
  );
};

export default StatsGrid;
