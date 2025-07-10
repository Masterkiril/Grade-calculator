const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  grades: {
    semester1: { type: String, enum: ['E1', 'E2', 'E3', 'E4', 'G2', 'G3', 'G4', 'G5', 'G6'] },
    semester2: { type: String, enum: ['E1', 'E2', 'E3', 'E4', 'G2', 'G3', 'G4', 'G5', 'G6'] },
    writtenExam: { type: String, enum: ['E1', 'E2', 'E3', 'E4', 'G2', 'G3', 'G4', 'G5', 'G6'] },
    oralExam: { type: String, enum: ['E1', 'E2', 'E3', 'E4', 'G2', 'G3', 'G4', 'G5', 'G6'] }
  },
  finalGrade: String,
  prognosis: String
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);

// Схема уже корректна, изменений не требуется