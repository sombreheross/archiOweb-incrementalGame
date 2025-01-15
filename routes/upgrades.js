import express from "express";
import Upgrade from "../models/Upgrade.js";
import UserUpgrade from "../models/UserUpgrade.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* GET upgrades listing with pagination and filters */
router.get("/", protect, async (req, res, next) => {
  console.log('GET /upgrades - Query parameters:', req.query);
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 10;
  const skip = (page - 1) * limit;
  console.log('Pagination:', { page, limit, skip });
  
  // Tri
  const sortField = req.query.sort || 'name';
  const sortOrder = req.query.order || 'asc';
  const sortOptions = { [sortField]: sortOrder === 'desc' ? -1 : 1 };
  console.log('Sort options:', sortOptions);
  
  // Filtres optionnels
  const { minProduction, maxProduction, minPrice, maxPrice, name, owned } = req.query;
  const filter = {};
  
  if (minProduction) filter.production = { $gte: parseFloat(minProduction) };
  if (maxProduction) filter.production = { ...filter.production, $lte: parseFloat(maxProduction) };
  if (minPrice) filter.price = { $gte: parseFloat(minPrice) };
  if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
  if (name) filter.name = new RegExp(name, 'i');
  if (owned !== undefined) {
    // On doit d'abord récupérer les upgrades possédés par l'utilisateur
    const userUpgrades = await UserUpgrade.find({ user_id: req.user._id });
    const ownedUpgradeIds = userUpgrades.map(uu => uu.upgrade_id);
    
    if (owned === 'true') {
      filter._id = { $in: ownedUpgradeIds };
    } else {
      filter._id = { $nin: ownedUpgradeIds };
    }
  }

  console.log('Applied filters:', filter);

  try {
    let query = Upgrade.find(filter).sort(sortOptions);
    
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
      console.log('Applying pagination with limit:', limit);
    } else {
      console.log('Pagination disabled');
    }
    
    const upgrades = await query;
    console.log(`Found ${upgrades.length} upgrades`);
    
    const total = await Upgrade.countDocuments(filter);
    console.log('Total documents:', total);
    
    res.json({
      upgrades,
      pagination: limit === 0 ? null : {
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

export default router; 