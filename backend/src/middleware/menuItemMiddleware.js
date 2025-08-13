// middlewares/menuItemMiddleware.js
import Drink from "../models/drinkModel.js";
import MenuItem from "../models/menuItemModel.js";

export const validateCreateMenuItem = async (req, res, next) => {
  const { item_id, name, category, base_price } = req.body; // sửa cho khớp key
  if (!item_id || !name || !category || base_price === undefined) {
    return res.status(400).json({
      success: false,
      message: "item_id, name, category, base_price are required",
    });
  }
  const existMI = await MenuItem.findById(item_id);
  if (existMI)
    return res
      .status(400)
      .json({ success: false, message: "item_id already exists in MenuItem" });

  // đảm bảo Drink tồn tại để không vướng FK
  const existDrink = await Drink.findById(item_id);
  if (!existDrink) {
    return res.status(400).json({
      success: false,
      message: "Drink (drink_id=item_id) does not exist — create Drink first",
    });
  }
  next();
};

export const validateUpdateMenuItem = async (req, res, next) => {
  const { base_price, cost } = req.body;
  if (basePrice !== undefined && Number(basePrice) < 0)
    return res
      .status(400)
      .json({ success: false, message: "basePrice must be >= 0" });
  if (cost !== undefined && Number(cost) < 0)
    return res
      .status(400)
      .json({ success: false, message: "cost must be >= 0" });
  next();
};
