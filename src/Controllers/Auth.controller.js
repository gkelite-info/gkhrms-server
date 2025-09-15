import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../Modals/UserModal.js";
import { loginSchema, signupSchema } from "../Validations/Auth.validation.js";
import { getCached, setCached } from "../Redis/redisCache.js";
import logger from "../Utils/Logger.js";

export const signup = async (req, res) => {
  const { error } = signupSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, password } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ message: "All fields are required" });

  const existingUser = await UserModel.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const hashedPass = await bcrypt.hash(password, 10);
  const user = new UserModel({ name, email, password: hashedPass });
  await user.save();
  return res.status(201).json({ message: "User Created..!" });
};

export const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(404).json({ message: "User Not Found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "In-Correct Password" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, organization: user.organization },
    process.env.JWT_SECRET
  );
  return res.status(200).json({ token });
};

export const profile = async (req, res) => {
  const { id } = req;
  const user = await UserModel.findById(id).select("-password");
  if (!user) return res.status(404).json({ message: "User Not Found" });
  return res.status(200).json(user);
};

export const getEmpSepOrganization = async (req, res) => {
  const { organization } = req.params;
  const emps = await UserModel.find({ organization }).select("-password -__v");
  return res.status(200).json(emps ?? []);
};

// added hr to ceo
export const addedHr = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, organization } = req.body;

  const { error } = signupSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const existingUser = await UserModel.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const hashedPass = await bcrypt.hash(password, 10);

  const emp = new UserModel({
    name,
    email,
    role,
    organization,
    password: hashedPass,
    reportsTo: id,
  });

  await emp.save();
  return res.status(201).json({ message: "Hr created" });
};


async function buildHierarchy(userId) {
  const user = await UserModel.findById(userId).lean();

  if (!user) return null;

  const subordinates = await UserModel.find({ reportsTo: userId }).lean();

  const children = await Promise.all(
    subordinates.map(sub => buildHierarchy(sub._id))
  );

  return {
    _id: user._id,
    name: user.name,
    role: user.role,
    organization: user.organization,
    children: children.filter(Boolean),
  };
}

// hierarchy employees
export const hierarchyEmps = async (req, res) => {
  const { organization } = req.params;
  logger.info(`ℹ️ HIERARCHY EMP API HI ${organization}`);
  const cacheKey = `hierarchy:${organization}`;

  const cachedData = await getCached(req.redisClient, cacheKey);
  if (cachedData) {
    logger.info(`✅Cache hit ${organization}`);
    return res.status(200).json(cachedData);
  }

  const topUsers = await UserModel.find({
    organization,
    reportsTo: null,
  }).lean();

  const hierarchy = await Promise.all(
    topUsers.map(user => buildHierarchy(user._id))
  );

  const result = { organization, hierarchy };
  await setCached(req.redisClient, cacheKey, result);
  return res.status(200).json(result);
}