import express from "express";
import Upgrade from "../models/Upgrade.js";
import UserUpgrade from "../models/UserUpgrade.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* GET upgrades listing with pagination and filters */
router.get("/", protect, async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Filtres optionnels
  const { minProduction, maxProduction, minPrice, maxPrice, name } = req.query;
  const filter = {};
  
  if (minProduction) filter.production = { $gte: parseFloat(minProduction) };
  if (maxProduction) filter.production = { ...filter.production, $lte: parseFloat(maxProduction) };
  if (minPrice) filter.price = { $gte: parseFloat(minPrice) };
  if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
  if (name) filter.name = new RegExp(name, 'i');

  try {
    const upgrades = await Upgrade.find(filter)
      .sort("name")
      .skip(skip)
      .limit(limit);
    
    const total = await Upgrade.countDocuments(filter);
    
    res.json({
      upgrades,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    next(err);
  }
});

/* GET specific upgrade */
router.get("/:id", protect, (req, res, next) => {
  Upgrade.findById(req.params.id)
    .then(upgrade => {
      if (!upgrade) return res.status(404).send("Upgrade not found");
      res.send(upgrade);
    })
    .catch(err => {
      next(err);
    });
});

/* POST buy/unlock upgrade */
router.post("/:id/buy", protect, async (req, res, next) => {
  try {
    // Check if upgrade exists
    const upgrade = await Upgrade.findById(req.params.id);
    if (!upgrade) {
      return res.status(404).json({ message: "Upgrade not found" });
    }

    // Check if user already has this upgrade
    const existingUpgrade = await UserUpgrade.findOne({
      user_id: req.user.id,
      upgrade_id: req.params.id
    });

    if (existingUpgrade) {
      return res.status(400).json({ message: "Upgrade already owned" });
    }

    // If upgrade has a prerequisite, check if user has it
    if (upgrade.unlockLevel) {
      const hasPrerequisite = await UserUpgrade.findOne({
        user_id: req.user.id,
        upgrade_id: upgrade.unlockLevel
      });

      if (!hasPrerequisite) {
        return res.status(400).json({ 
          message: "Prerequisites not met for this upgrade" 
        });
      }
    }

    // Create new user-upgrade link
    const userUpgrade = new UserUpgrade({
      user_id: req.user.id,
      upgrade_id: req.params.id
    });

    await userUpgrade.save();
    const savedUpgrade = await userUpgrade.populate('upgrade_id');

    res.status(201).json({
      upgradeId: savedUpgrade.upgrade_id._id,
      name: savedUpgrade.upgrade_id.name,
      production: savedUpgrade.upgrade_id.production,
      price: savedUpgrade.upgrade_id.price
    });
  } catch (err) {
    next(err);
  }
});

/* GET next available upgrades */
router.get("/next", protect, async (req, res, next) => {
  try {
    // Get all user's current upgrades
    const userUpgrades = await UserUpgrade.find({
      user_id: req.user.id
    }).select('upgrade_id');

    // Get user's upgrade IDs
    const userUpgradeIds = userUpgrades.map(ug => ug.upgrade_id.toString());

    // Get all upgrades
    const allUpgrades = await Upgrade.find().sort('name');

    // Find next available upgrade (has prerequisites met or no prerequisites)
    const nextAvailable = allUpgrades.find(upgrade => {
      const notOwned = !userUpgradeIds.includes(upgrade._id.toString());
      const prerequisiteMet = !upgrade.unlockLevel || userUpgradeIds.includes(upgrade.unlockLevel.toString());
      return notOwned && prerequisiteMet;
    });

    // Find next locked upgrade (has prerequisites not met)
    const nextLocked = allUpgrades.find(upgrade => {
      const notOwned = !userUpgradeIds.includes(upgrade._id.toString());
      const prerequisiteNotMet = upgrade.unlockLevel && !userUpgradeIds.includes(upgrade.unlockLevel.toString());
      return notOwned && prerequisiteNotMet;
    });

    res.json({
      nextAvailable: nextAvailable ? {
        id: nextAvailable._id,
        name: nextAvailable.name,
        production: nextAvailable.production,
        price: nextAvailable.price,
        unlockLevel: nextAvailable.unlockLevel
      } : null,
      nextLocked: nextLocked ? {
        id: nextLocked._id,
        name: nextLocked.name,
        production: nextLocked.production,
        price: nextLocked.price,
        unlockLevel: nextLocked.unlockLevel
      } : null
    });
  } catch (err) {
    next(err);
  }
});

/* POST initialize all upgrades for authenticated user */
router.post("/init", protect, async (req, res, next) => {
  try {
    // Get all upgrades
    const upgrades = await Upgrade.find();
    
    // Create user-upgrade links with default values
    const userUpgrades = upgrades.map(upgrade => ({
      user_id: req.user.id,
      upgrade_id: upgrade._id
    }));

    // Insert all links, skip duplicates
    const result = await UserUpgrade.insertMany(userUpgrades, {
      ordered: false,
      skipDuplicates: true
    });

    // Get created links with upgrade details
    const createdLinks = await UserUpgrade.find({ user_id: req.user.id })
      .populate('upgrade_id');

    res.status(201).json({
      userId: req.user.id,
      upgrades: createdLinks.map(link => ({
        upgradeId: link.upgrade_id._id,
        name: link.upgrade_id.name,
        production: link.upgrade_id.production,
        price: link.upgrade_id.price
      }))
    });
  } catch (err) {
    next(err);
  }
});

export default router; 