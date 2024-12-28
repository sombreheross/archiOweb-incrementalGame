import express from "express";
import Resource from "../models/resource.js";

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

export default router;
