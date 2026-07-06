import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Order from "../models/order.model.js";
import Reservation from "../models/booking.model.js";

/* -------------------------------------------------------------------------- */
/*                              Dashboard Overview                            */
/* -------------------------------------------------------------------------- */

export const getDashboard = async (req, res) => {
  try {
    /* ------------------------------ Statistics ----------------------------- */

    const totalUsers = await User.countDocuments();

    const totalCustomers = await User.countDocuments({
      role: "customer",
    });

    const totalOwners = await User.countDocuments({
      role: "owner",
    });

    const totalRestaurants = await Restaurant.countDocuments();

    const totalOrders = await Order.countDocuments();

    const totalReservations = await Reservation.countDocuments();

    /* ----------------------------- Total Revenue ---------------------------- */

    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    /* ---------------------------- Average Rating --------------------------- */

    const ratingResult = await Restaurant.aggregate([
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    const averageRating =
      ratingResult.length > 0
        ? Number(ratingResult[0].averageRating.toFixed(1))
        : 0;

    /* ---------------------------- Latest Orders ---------------------------- */

    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name imageUrl")
      .populate("subOrders.restaurant", "name logoUrl");

    /* --------------------------- Top Restaurants --------------------------- */

    const topRestaurants = await Restaurant.find()
      .sort({ rating: -1 })
      .limit(5)
      .select("name logoUrl rating")
      .lean();

    for (const restaurant of topRestaurants) {
      const orders = await Order.aggregate([
        {
          $unwind: "$subOrders",
        },
        {
          $match: {
            "subOrders.restaurant": restaurant._id,
          },
        },
        {
          $group: {
            _id: null,
            orders: {
              $sum: 1,
            },
            revenue: {
              $sum: "$subOrders.subtotal",
            },
          },
        },
      ]);

      restaurant.orders = orders[0]?.orders || 0;
      restaurant.revenue = orders[0]?.revenue || 0;
    }

    /* ---------------------------- Orders Trend ---------------------------- */

    const currentYear = new Date().getFullYear();

    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },
          orders: {
            $sum: 1,
          },
        },
      },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const ordersTrend = monthNames.map((month, index) => {
      const found = monthlyOrders.find((m) => m._id.month === index + 1);

      return {
        month,
        orders: found ? found.orders : 0,
      };
    });

    /* ---------------------------- Users Growth ---------------------------- */

    const monthlyUsers = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },
          users: {
            $sum: 1,
          },
        },
      },
    ]);

    let cumulative = 0;

    const usersGrowth = monthNames.map((month, index) => {
      const found = monthlyUsers.find((u) => u._id.month === index + 1);

      cumulative += found ? found.users : 0;

      return {
        month,
        users: cumulative,
      };
    });

    /* ------------------------- Recent Activities -------------------------- */

    /* --------------------------- Recent Activity -------------------------- */

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(2);

    const recentRestaurants = await Restaurant.find()
      .sort({ createdAt: -1 })
      .limit(1);

    const recentOrdersActivity = await Order.find()
      .sort({ createdAt: -1 })
      .limit(1);

    const recentReservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(1);

    const recentActivities = [];

    recentUsers.forEach((user) => {
      recentActivities.push({
        id: user._id,
        type: "user",
        title: "New user registered",
        description: `${user.name} joined Yumify.`,
        time: user.createdAt,
      });
    });

    recentRestaurants.forEach((restaurant) => {
      recentActivities.push({
        id: restaurant._id,
        type: "restaurant",
        title: "Restaurant created",
        description: `${restaurant.name} joined Yumify.`,
        time: restaurant.createdAt,
      });
    });

    recentOrdersActivity.forEach((order) => {
      recentActivities.push({
        id: order._id,
        type: "order",
        title: "Order placed",
        description: `Order #${order._id.toString().slice(-6)} was placed.`,
        time: order.createdAt,
      });
    });

    recentReservations.forEach((reservation) => {
      recentActivities.push({
        id: reservation._id,
        type: "reservation",
        title: "Reservation confirmed",
        description: "A new reservation has been created.",
        time: reservation.createdAt,
      });
    });

    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

    recentActivities.splice(5);

    /* --------------------------- Platform Health -------------------------- */

    const platformHealth = {
      api: "Healthy",
      mongodb: "Connected",
      awsS3: "Connected",
      aiService: "Operational",
      emailService: "Running",
      storageUsage: 68,
    };

    /* ------------------------------- Response ------------------------------ */

    res.status(200).json({
      success: true,

      adminProfile: {
        name: req.user.name,
        role: "Super Admin",
        image: req.user.imageUrl,
      },

      dashboardStats: {
        totalUsers,
        totalCustomers,
        totalOwners,
        totalRestaurants,
        totalOrders,
        totalReservations,
        totalRevenue,
        averageRating,
        aiRequestsToday: 0,
      },

      ordersTrend,
      usersGrowth,
      recentActivities,
      latestOrders,
      topRestaurants,
      platformHealth,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard.",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                              Placeholder APIs                              */
/* -------------------------------------------------------------------------- */

export const getUsers = async (req, res) => {
  res.json({
    success: true,
    message: "Users endpoint coming soon.",
  });
};

export const getRestaurants = async (req, res) => {
  res.json({
    success: true,
    message: "Restaurants endpoint coming soon.",
  });
};

export const getOrders = async (req, res) => {
  res.json({
    success: true,
    message: "Orders endpoint coming soon.",
  });
};

export const getReservations = async (req, res) => {
  res.json({
    success: true,
    message: "Reservations endpoint coming soon.",
  });
};

export const getReviews = async (req, res) => {
  res.json({
    success: true,
    message: "Reviews endpoint coming soon.",
  });
};

export const getPromotions = async (req, res) => {
  res.json({
    success: true,
    message: "Promotions endpoint coming soon.",
  });
};

export const getSettings = async (req, res) => {
  res.json({
    success: true,
    message: "Settings endpoint coming soon.",
  });
};
