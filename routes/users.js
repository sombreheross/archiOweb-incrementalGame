import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(409).json({ message: 'User already exists' });

        // Créer le nouvel utilisateur
        const newUser = new User({ username, password });
        await newUser.save();

        // Générer le token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            message: 'User registered successfully',
            token 
        });
    } catch (err) {
        next(err);
    }
});

// Route de connexion
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        next(err);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

// Exemple de route protégée
router.get('/protected', protect, (req, res) => {
    res.json({ message: 'Welcome to the protected route', user: req.user });
});

// Route pour modifier le statut dynamo
router.patch('/dynamo', protect, async (req, res) => {
    try {
        if (typeof req.body.dynamo !== 'boolean') {
            return res.status(400).json({ 
                message: 'dynamo must be a boolean value (true or false)' 
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.dynamo = req.body.dynamo;
        await user.save();

        res.json({ 
            message: 'Dynamo status updated',
            dynamo: user.dynamo 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route pour modifier la position
router.patch('/position', protect, async (req, res) => {
    try {
        const { longitude, latitude } = req.body;

        if (typeof longitude !== 'number' || typeof latitude !== 'number') {
            return res.status(400).json({ 
                message: 'longitude et latitude doivent être des nombres' 
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        user.position = {
            type: 'Point',
            coordinates: [longitude, latitude]
        };
        
        await user.save();

        res.json({ 
            message: 'Position mise à jour',
            position: user.position 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;