import PromoCode from "../models/promo.model.js";

// =============================
// Create Promo Code
// =============================
export const createPromo = async (req, res) => {
  try {
    const { code, type, value, minOrder, expiresAt } = req.body;

    const exists = await PromoCode.findOne({
      code: code.toUpperCase(),
    });

    if (exists) {
      return res.status(400).json({
        message: "Promo code already exists",
      });
    }

    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      type,
      value,
      minOrder,
      expiresAt,
      active: true,
    });

    res.status(201).json(promo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =============================
// Get All Promo Codes
// =============================
export const getPromos = async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({
      createdAt: -1,
    });

    res.json(promos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =============================
// Validate Promo Code
// =============================
export const validatePromo = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
    });

    if (!promo) {
      return res.status(404).json({
        message: "Invalid promo code",
      });
    }

    if (!promo.active) {
      return res.status(400).json({
        message: "Promo code disabled",
      });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({
        message: "Promo code expired",
      });
    }

    if (subtotal < promo.minOrder) {
      return res.status(400).json({
        message: `Minimum order is $${promo.minOrder}`,
      });
    }

    let discount = 0;

    if (promo.type === "percentage") {
      discount = subtotal * (promo.value / 100);
    }

    if (promo.type === "fixed") {
      discount = promo.value;
    }

    res.json({
      valid: true,
      discount,
      promo: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =============================
// Delete Promo Code
// =============================
export const deletePromo = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);

    if (!promo) {
      return res.status(404).json({
        message: "Promo not found",
      });
    }

    await promo.deleteOne();

    res.json({
      message: "Promo deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =============================
// Enable / Disable Promo
// =============================
export const togglePromoStatus = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);

    if (!promo) {
      return res.status(404).json({
        message: "Promo not found",
      });
    }

    promo.active = !promo.active;

    await promo.save();

    res.json({
      message: `Promo ${promo.active ? "enabled" : "disabled"} successfully`,
      promo,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
