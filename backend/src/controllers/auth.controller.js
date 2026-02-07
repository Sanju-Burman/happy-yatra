const authService = require('../services/auth.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { payload, accessToken, refreshToken } = await authService.login(email, password);

    // Align with frontend expectations (snake_case and 'user' instead of 'payload')
    res.status(200).json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: payload
    });
  } catch (error) {
    res.status(401).json({
      message: "Login failed",
      error: error.message
    });
  }
};

const signup = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    // Frontend sends 'name', Backend model expects 'username'
    const userToCreate = username || name;

    if (!userToCreate) {
      return res.status(400).json({ message: "Username or name is required" });
    }

    const newUser = await authService.signup(userToCreate, email, password);

    // Automatically log in after signup or return what frontend expects
    // For now, let's at least return the user object to avoid 'data.user' being undefined
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
};

const logout = async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.body;
    await authService.blacklistTokens(accessToken, refreshToken);
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const result = await authService.refresh(refresh_token);
    res.json({
      access_token: result.accessToken,
      refresh_token: refresh_token // Keep the same or rotate if needed
    });
  } catch (error) {
    res.status(401).json({ message: 'Refresh failed', error: error.message });
  }
};

module.exports = { login, signup, refresh, logout };
