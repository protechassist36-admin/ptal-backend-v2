import { Router } from 'express';
import { db } from '../db';
import { demoUsers } from '../schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await db.select().from(demoUsers);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.select().from(demoUsers).where(eq(demoUsers.id, Number(id)));
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST new user
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const [newUser] = await db.insert(demoUsers).values({ name, email }).returning();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const [updatedUser] = await db.update(demoUsers).set({ name, email }).where(eq(demoUsers.id, Number(id))).returning();
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(demoUsers).where(eq(demoUsers.id, Number(id)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
