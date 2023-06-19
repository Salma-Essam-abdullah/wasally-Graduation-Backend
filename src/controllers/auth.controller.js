const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const passport = require('passport');
const googleAuth = require('../services/googleAuth');
const session = require('express-session');
const User = require('../models/user.model');
const sendEmail = require('../services/sendEmail');
const jwt = require('jsonwebtoken');
var redirectUrl;
if (process.env.RUN_STATUS === 'local') {
  redirectUrl = 'localhost:3001';
} else {
  redirectUrl = 'wasally.me';
}
const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const URL = `${req.protocol}://${redirectUrl}/confirmEmail/${token}`;
  await sendEmail(req.body.email, `<a href='${URL}'>please click here to confirm your email</a>`);
  res.status(httpStatus.CREATED).send(user);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const foundedUser = await User.findOne({ email: email });
  if (foundedUser.isEmailVerified) {
    const user = await authService.loginUserWithEmailAndPassword(email, password, res);
    res.send(user);
  } else {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'please confirm your email' });
  }
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({
    ...tokens,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const forgotPassword = await authService.forgotPassword(req, res);
  res.status(httpStatus.NO_CONTENT).send(forgotPassword);
});

const resetPassword = catchAsync(async (req, res) => {
  const reset = await authService.resetPassword(req, res);
  return reset;
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const googleLogin = catchAsync(async (req, res) => {
  const user = await authService.loginUserWithGoogle(req, res);
  res.send(user);
});

const failureGoogle = catchAsync(async (req, res) => {
  res.status(200).send('Google login failed');
});

const logoutGoogle = catchAsync(async (req, res) => {
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});
const confirmEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  if (token == undefined || token == null || !token) {
    res.status(400).send({ message: 'token is required' });
  } else {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      const { id } = decoded;
      const foundedUser = await User.findById(id);
      if (foundedUser) {
        if (foundedUser.isEmailVerified) {
          res.status(200).send({ message: 'user already verified' });
        } else {
          foundedUser.isEmailVerified = true;
          await foundedUser.save();
          res.status(200).send({ message: 'user verified successfully' });
        }
      } else {
        res.status(400).send({ message: 'invalid email' });
      }
    } else {
      res.status(400).send({ message: 'invalid token' });
    }
  }
});
module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  googleLogin,
  failureGoogle,
  logoutGoogle,
  confirmEmail,
};
