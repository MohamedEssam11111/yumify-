import { CheckCircle2, ChefHat, Clock3, Package, XCircle } from "lucide-react";

const statusStyles = {
  delivered: {
    icon: CheckCircle2,
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
  },

  preparing: {
    icon: ChefHat,
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
  },

  pending: {
    icon: Clock3,
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
  },

  cancelled: {
    icon: XCircle,
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
};

const LatestOrders = ({ orders }) => {
  return (
    <section
      className="
        mt-16
        rounded-[28px]
        border
        border-white/10
        bg-[#0B1024]
        p-8
        shadow-[0_0_40px_rgba(124,92,255,.10)]
      "
    >
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Latest Orders</h2>

          <p className="mt-2 text-[#AAB3D3]">
            Recent orders across the Yumify platform.
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#AAB3D3]">
          {orders.length} Orders
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-sm uppercase tracking-wider text-[#6D7592]">
              <th className="pb-4">Customer</th>
              <th className="pb-4">Restaurant</th>
              <th className="pb-4">Amount</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const style = statusStyles[order.status] || statusStyles.pending;

              const Icon = style.icon;

              return (
                <tr
                  key={order._id}
                  className="
                    group
                    transition-all
                    duration-300
                  "
                >
                  {/* Customer */}

                  <td className="rounded-l-2xl border border-r-0 border-white/10 bg-white/[0.03] px-5 py-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-xl
                          bg-gradient-to-br
                          from-[#7C5CFF]
                          to-[#4AE8FF]
                          font-bold
                          text-white
                        "
                      >
                        {order.customer?.name?.charAt(0) || "U"}
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          {order.customer?.name}
                        </h3>

                        <p className="text-sm text-[#6D7592]">
                          #{order._id.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Restaurant */}

                  <td className="border-y border-white/10 bg-white/[0.03] px-5 py-5">
                    <div className="inline-flex items-center rounded-full bg-[#FF901C]/10 px-4 py-2 text-sm font-semibold text-[#FF901C]">
                      {order.subOrders?.[0]?.restaurant?.name || "Restaurant"}
                    </div>
                  </td>

                  {/* Price */}

                  <td className="border-y border-white/10 bg-white/[0.03] px-5 py-5">
                    <span className="text-lg font-bold text-white">
                      ${order.totalPrice}
                    </span>
                  </td>

                  {/* Status */}

                  <td className="border-y border-white/10 bg-white/[0.03] px-5 py-5">
                    <div
                      className={`
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        ${style.bg}
                        ${style.text}
                        ${style.border}
                      `}
                    >
                      <Icon size={16} />

                      {order.status}
                    </div>
                  </td>

                  {/* Date */}

                  <td className="rounded-r-2xl border border-l-0 border-white/10 bg-white/[0.03] px-5 py-5 text-[#AAB3D3]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={70} className="mb-5 text-[#6D7592]" />

            <h3 className="text-2xl font-bold text-white">No Orders Yet</h3>

            <p className="mt-3 max-w-sm text-[#AAB3D3]">
              Orders from all restaurants will appear here as customers begin
              placing them.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestOrders;
