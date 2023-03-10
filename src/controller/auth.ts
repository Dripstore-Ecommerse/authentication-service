import { Request, Response, NextFunction } from "express";
import AppError from "../util/AppError";
import filterData from "../util/filterData";
import User from "../model/userModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_EXPIRE, JWT_SECRET } from "../config/base";
import catchAsync from "../util/catchAsync";
import { IUser } from "../types/global";
import RabbitMQProducer from "@dripstore/common/build/util/RabbitMQProducer";

const sendMessageToQueue = (queue: string, obj: object) => {
  const message = JSON.stringify(obj);

  const producer = new RabbitMQProducer(
    "amqp://default_user_uJAu0ttkJDvBBolxyPe:eDbrE5bOGGXMFsQh3LpmtLIDqcQzvB52@10.105.181.43",
    queue
  );

  producer.send(message);
  producer.close();
};

const getJwt = (user: IUser, secret: string, exp: any) => {
  console.log(secret);
  return jwt.sign({ _id: user._id, role: user.role }, secret, {
    expiresIn: exp,
  });
};
// Should be a schema object!
const correctPassword = async function (candidatePwd: string, userPwd: string) {
  return await bcrypt.compare(candidatePwd, userPwd);
};

export const login = catchAsync(async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password)
    return next(new AppError(400, "please provide email and password"));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await correctPassword(req.body.password, user.password)))
    return next(new AppError(401, "Incorrect email or password"));

  const token = getJwt(user, JWT_SECRET, JWT_EXPIRE);
  req.session = { jwt: token };

  res.status(200).json({
    status: true,
    message: "Login successful",
    token,
  });
});

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  req.session = null;
  res.status(200).json({
    status: true,
    message: "Logout successful!",
  });
}

export const register = catchAsync(async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  filterData(req.body, ["name", "email", "password"]);
  const newUser = await User.create(req.body);
  const token = getJwt(newUser, JWT_SECRET, JWT_EXPIRE);
  req.session = { jwt: token };

  sendMessageToQueue("user-to-cart", newUser);
  sendMessageToQueue("user-to-coupon", newUser);

  res.status(201).json({
    status: true,
    message: "User registered!",
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    },
  });
});

export const me = catchAsync(async function me(
  req: Request,
  res: Response
): Promise<any> {
  res.status(200).json({
    status: true,
    user: {
      name: req.user.name,
      email: req.user.email,
    },
  });
});
