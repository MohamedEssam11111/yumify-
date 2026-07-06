import { Star, TrendingUp, UtensilsCrossed, Trophy } from "lucide-react";

const TopRestaurants = ({ restaurants }) => {
  return (
    <section
      className="
        mt-16
        rounded-[28px]
        border
        border-white/10
        bg-[#0B1024]
        p-8
        shadow-[0_0_40px_rgba(255,144,28,.08)]
      "
    >
      {/* Header */}

      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Top Restaurants</h2>

          <p className="mt-2 text-[#AAB3D3]">
            Highest performing restaurants across the Yumify platform.
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-[#FF901C]/20
            bg-[#FF901C]/10
            px-4
            py-2
            text-sm
            font-semibold
            text-[#FF901C]
          "
        >
          <Trophy size={16} />
          Leaderboard
        </div>
      </div>

      <div className="space-y-5">
        {restaurants.map((restaurant, index) => (
          <div
            key={restaurant._id}
            className="
              group
              flex
              flex-col
              gap-6
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-6
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#FF901C]/25
              hover:bg-white/[0.05]
              hover:shadow-[0_0_35px_rgba(255,144,28,.12)]

              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            {/* Left */}

            <div className="flex items-center gap-5">
              {/* Ranking */}

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-[#FF901C]
                  to-[#FFB347]
                  font-black
                  text-[#050816]
                  shadow-[0_0_25px_rgba(255,144,28,.35)]
                "
              >
                #{index + 1}
              </div>

              {/* Logo */}

              <img
                src={restaurant.logoUrl || "/restaurant-default.png"}
                alt={restaurant.name}
                className="
                  h-16
                  w-16
                  rounded-2xl
                  border
                  border-white/10
                  object-cover
                "
                onError={(e) => {
                  e.target.src = "/restaurant-default.png";
                }}
              />

              {/* Info */}

              <div>
                <h3 className="text-xl font-bold text-white">
                  {restaurant.name}
                </h3>

                <p className="mt-1 flex items-center gap-2 text-[#AAB3D3]">
                  <UtensilsCrossed size={15} />
                  Restaurant Partner
                </p>
              </div>
            </div>

            {/* Right */}

            <div
              className="
                grid
                grid-cols-3
                gap-6

                lg:min-w-[420px]
              "
            >
              {/* Rating */}

              <div className="text-center">
                <div className="flex justify-center">
                  <Star size={18} className="fill-yellow-400 text-yellow-400" />
                </div>

                <h4 className="mt-2 text-2xl font-black text-white">
                  {restaurant.rating?.toFixed(1) || "0.0"}
                </h4>

                <p className="text-sm text-[#6D7592]">Rating</p>
              </div>

              {/* Orders */}

              <div className="text-center">
                <div className="flex justify-center">
                  <TrendingUp size={18} className="text-[#41E9FF]" />
                </div>

                <h4 className="mt-2 text-2xl font-black text-white">
                  {restaurant.orders ?? "--"}
                </h4>

                <p className="text-sm text-[#6D7592]">Orders</p>
              </div>

              {/* Revenue */}

              <div className="text-center">
                <div className="flex justify-center">
                  <TrendingUp size={18} className="text-[#22C55E]" />
                </div>

                <h4 className="mt-2 text-2xl font-black text-green-400">
                  ${restaurant.revenue ?? 0}
                </h4>

                <p className="text-sm text-[#6D7592]">Revenue</p>
              </div>
            </div>
          </div>
        ))}

        {restaurants.length === 0 && (
          <div className="py-20 text-center">
            <UtensilsCrossed size={70} className="mx-auto text-[#6D7592]" />

            <h3 className="mt-5 text-2xl font-bold text-white">
              No Restaurants Found
            </h3>

            <p className="mt-3 text-[#AAB3D3]">
              Restaurants will appear here once they join the platform.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopRestaurants;
