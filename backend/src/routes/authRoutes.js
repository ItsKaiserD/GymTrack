import express from 'express';

const router = express.Router();

router.get('/sign_in', async(req, res) => {
  // Handle login logic here
  res.send("Sign In endpoint");
});

router.get('/login', async(req, res) => {
  // Handle login logic here
  res.send("Login endpoint");
});

export default router;
