const ErrorResponse = require('../utils/ErrorResponse');
const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const {role, accessToken, refreshToken } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { email: email , role: role }
    });
  } catch (error) {
    next(error);
  }
};

const signup = async (req, res, next) => {
  try {
    const { username, name, email, password } = req.body;
    const userToCreate = username || name;

    if (!userToCreate) {
      return next(new ErrorResponse("Username or name is required", 400));
    }

    const { newUser, payload, accessToken, refreshToken } = await authService.signup(userToCreate, email, password);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      access_token: accessToken,
      refresh_token: refreshToken,
      user: payload
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.body;
    await authService.blacklistTokens(accessToken, refreshToken);
    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const result = await authService.refresh(refresh_token);
    res.json({
      success: true,
      access_token: result.accessToken,
      refresh_token: result.refreshToken
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 401));
  }
};

module.exports = { login, signup, refresh, logout };
