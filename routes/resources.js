import express from "express";
import Resource from "../models/resource.js";
import UserResource from "../models/userResource.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* GET resources listing. */
router.get("/", (req, res, next) => {
  Resource.find()
    .sort("name") // Trier par nom
    .exec()
    .then(resources => {
      res.send(resources);
    })
    .catch(err => {
      next(err);
    });
});

/* POST new resource */
router.post("/", (req, res, next) => {
  const newResource = new Resource(req.body);

  newResource.save()
    .then(savedResource => {
      res.send(savedResource);
    })
    .catch(err => {
      next(err);
    });
});

/* GET resource by ID */
router.get("/:id", (req, res, next) => {
  Resource.findById(req.params.id)
    .then(resource => {
      if (!resource) return res.status(404).send("Resource not found");
      res.send(resource);
    })
    .catch(err => {
      next(err);
    });
});

/* DELETE resource by ID */
router.delete("/:id", (req, res, next) => {
  Resource.findByIdAndDelete(req.params.id)
    .then(deletedResource => {
      if (!deletedResource) return res.status(404).send("Resource not found");
      res.send(deletedResource);
    })
    .catch(err => {
      next(err);
    });
});

/* PUT (update) resource by ID */
router.put("/:id", (req, res, next) => {
  Resource.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updatedResource => {
      if (!updatedResource) return res.status(404).send("Resource not found");
      res.send(updatedResource);
    })
    .catch(err => {
      next(err);
    });
});

/* GET specific resource amount for authenticated user */
router.get("/:id/resource", protect, async (req, res, next) => {
  try {
    const userResource = await UserResource.findOne({
      user_id: req.user.id,
      resource_id: req.params.id
    }).populate('resource_id');

    if (!userResource) {
      return res.status(404).json({
        message: "Resource not found for this user",
        amount: 0  // Return 0 if user doesn't have this resource yet
      });
    }

    res.json({
      resourceId: userResource.resource_id._id,
      name: userResource.resource_id.name,
      price: userResource.resource_id.price,
      amount: userResource.amount
    });
  } catch (err) {
    next(err);
  }
});

/* POST create new user-resource link */
router.post("/:id/resource", protect, async (req, res, next) => {
  try {
    const { amount } = req.body;

    // Check if resource exists
    const resourceExists = await Resource.findById(req.params.id);
    if (!resourceExists) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check if link already exists
    const existingLink = await UserResource.findOne({
      user_id: req.user.id,
      resource_id: req.params.id
    });
    
    if (existingLink) {
      return res.status(400).json({ message: "Resource already linked to user" });
    }

    // Create new link
    const userResource = new UserResource({
      user_id: req.user.id,
      resource_id: req.params.id,
      amount: amount || 0
    });

    await userResource.save();
    const savedResource = await userResource.populate('resource_id');

    res.status(201).json({
      resourceId: savedResource.resource_id._id,
      name: savedResource.resource_id.name,
      price: savedResource.resource_id.price,
      amount: savedResource.amount
    });
  } catch (err) {
    next(err);
  }
});

/* PATCH update resource amount */
router.patch("/:id/resource", protect, async (req, res, next) => {
  try {
    const { amount } = req.body;

    const userResource = await UserResource.findOneAndUpdate(
      {
        user_id: req.user.id,
        resource_id: req.params.id
      },
      { amount: amount },
      { new: true }
    ).populate('resource_id');

    if (!userResource) {
      return res.status(404).json({ message: "Resource link not found" });
    }

    res.json({
      resourceId: userResource.resource_id._id,
      name: userResource.resource_id.name,
      price: userResource.resource_id.price,
      amount: userResource.amount
    });
  } catch (err) {
    next(err);
  }
});

/* PATCH (update) resource price */
router.patch("/:id", (req, res, next) => {
  // Only allow price updates
  const { price } = req.body;
  
  if (!price) {
    return res.status(400).json({ message: "Price is required" });
  }

  Resource.findByIdAndUpdate(
    req.params.id, 
    { price: price }, 
    { new: true }
  )
    .then(updatedResource => {
      if (!updatedResource) return res.status(404).send("Resource not found");
      res.send(updatedResource);
    })
    .catch(err => {
      next(err);
    });
});

export default router;