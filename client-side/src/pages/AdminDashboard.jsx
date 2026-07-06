import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import adminAPI from "../apis/admin.api";

import NeonBackground from "../components/AdminComponents/Shared/NeonBackground";

import AdminHeader from "../components/AdminComponents/Header/AdminHeader";
import HeroSection from "../components/AdminComponents/Hero/HeroSection";

import StatsGrid from "../components/AdminComponents/Stats/StatsGrid";

import AnalyticsSection from "../components/AdminComponents/Charts/AnalyticsSection";

import RecentActivity from "../components/AdminComponents/Activity/RecentActivity";

import LatestOrders from "../components/AdminComponents/Orders/LatestOrders";

import TopRestaurants from "../components/AdminComponents/Restaurants/TopRestaurants";

import PlatformHealth from "../components/AdminComponents/Health/PlatformHealth";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const response = await adminAPI.dashboard();

        if (response.data.success) {
          setDashboard(response.data);
        } else {
          setError("Failed to load dashboard.");
        }
      } catch (err) {
        console.error("Dashboard Error:", err);

        setError(
          err.response?.data?.message || "Unable to connect to the server.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                   Loading                                  */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full border-4 border-[#FF901C]/20 border-t-[#FF901C] animate-spin" />

          <div className="text-center">
            <h2 className="text-white text-xl font-bold">
              Loading Dashboard...
            </h2>

            <p className="text-[#AAB3D3] mt-2">
              Fetching Yumify platform analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                    Error                                   */
  /* -------------------------------------------------------------------------- */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] px-6">
        <div className="max-w-lg rounded-3xl border border-red-500/20 bg-[#0B1024] p-10 text-center">
          <h2 className="text-3xl font-bold text-red-400">Dashboard Error</h2>

          <p className="mt-4 text-[#AAB3D3]">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-8 rounded-xl bg-[#FF901C] px-8 py-3 font-semibold text-white transition hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  /* -------------------------------------------------------------------------- */
  /*                                   JSX                                      */
  /* -------------------------------------------------------------------------- */

  return (
    <>
      <NeonBackground />

      <main className="relative z-10 mx-auto max-w-7xl space-y-16 px-6 py-10">
        {/* ================= Header ================= */}

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <AdminHeader adminProfile={dashboard.adminProfile} />
        </motion.div>

        {/* ================= Hero ================= */}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{
            delay: 0.15,
          }}
        >
          <HeroSection
            adminProfile={dashboard.adminProfile}
            dashboardStats={dashboard.dashboardStats}
          />
        </motion.div>

        {/* ================= Statistics ================= */}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <StatsGrid dashboardStats={dashboard.dashboardStats} />
        </motion.div>
        {/* ================= Analytics ================= */}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <AnalyticsSection
            ordersTrend={dashboard.ordersTrend}
            usersGrowth={dashboard.usersGrowth}
          />
        </motion.div>

        {/* ================= Activity + Latest Orders ================= */}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 xl:grid-cols-[0.95fr_1.55fr]"
        >
          <RecentActivity activities={dashboard.recentActivities} />

          <LatestOrders orders={dashboard.latestOrders} />
        </motion.div>

        {/* ================= Top Restaurants ================= */}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <TopRestaurants restaurants={dashboard.topRestaurants} />
        </motion.div>

        {/* ================= Platform Health ================= */}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <PlatformHealth platformHealth={dashboard.platformHealth} />
        </motion.div>
      </main>
    </>
  );
};

export default AdminDashboard;
