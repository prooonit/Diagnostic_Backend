import { loginUser, registerUser } from "../services/auth.service.js";
import { validateLogin, validateRegistration } from "../validators/auth.validator.js";

export async function register(req, res, next) {
  try {
    const user = await registerUser(validateRegistration(req.body));
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(validateLogin(req.body));
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export function me(req, res) {
  return res.status(200).json({ user: req.user });
}
