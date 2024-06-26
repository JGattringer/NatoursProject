const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// DEFINING THE USER SCHEMA

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A new User must have a name!'],
    unique: true,
    minlenght: [4, 'User names must have a minimum of 4 characters'],
    maxlen: [40, 'A User name must have maximum of 40 characters'],
  },
  email: {
    type: String,
    unique: true,
    validate: [validator.isEmail, 'Please fill a valid email address'],
    required: [true, 'A User must have an email!'],
    lowercase: true,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must have a minimum of 8 characters'],
    select: false,
  },
  passwordconfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// pre save middleware to encrypt password, works btween geting the data and save on DB
userSchema.pre('save', async function (next) {
  // Only run this function if password was modified
  if (!this.isModified('password')) return next();
  // hashing the password cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // once user signup we can "delete" the pass confirmation field
  this.passwordconfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// check if password is the same for login return true or false
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// create to generate random token for reset password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// CREATING THE MODEL
const User = mongoose.model('User', userSchema);

module.exports = User;
