const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware для проверки JWT
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.error('JWT token missing');
      return res.status(401).json({ error: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      console.error('User not found for token:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/', auth, async (req, res) => {
  try {
    console.log('Request body:', req.body); // Логируем входящие данные

    const { grades, finalGrade, prognosis } = req.body;

    // Валидация данных
    if (!grades || typeof grades !== 'object') {
      return res.status(400).json({ error: 'Invalid grades format' });
    }

    const requiredFields = ['semester1', 'semester2', 'writtenExam', 'oralExam'];
    for (const field of requiredFields) {
      if (!grades[field] || !['E1', 'E2', 'E3', 'E4', 'G2', 'G3', 'G4', 'G5', 'G6'].includes(grades[field])) {
        return res.status(400).json({ error: `Invalid or missing grade for ${field}` });
      }
    }

    // Обновляем пользователя
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        grades: {
          semester1: grades.semester1,
          semester2: grades.semester2,
          writtenExam: grades.writtenExam,
          oralExam: grades.oralExam
        },
        finalGrade,
        prognosis
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Load user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;