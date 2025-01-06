import express from "express";
import Upgrade from "../models/Upgrade.js";
import UserUpgrade from "../models/UserUpgrade.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* GET upgrades listing */
router.get("/", (req, res, next) => {
  Upgrade.find()
    .sort("name")
    .exec()
    .then(upgrades => {
      res.send(upgrades);
    })
    .catch(err => {
      next(err);
    });
});

/* GET specific upgrade */
router.get("/:id", (req, res, next) => {
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