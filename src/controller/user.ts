import { Request, Response, NextFunction } from "express";
import AppError from "../util/AppError";
import User from "../model/userModel";
import catchAsync from "../util/catchAsync";

export const getAllUsers = catchAsync(async function getAllUsers(
  req: Request,
  res: Response
): Promise<any> {
  const users = await User.find(req.query);
  res.status(200).json({
    status: true,
    length: users.length,
    users,
  });
});
export const getUser = catchAsync(async function getUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = await User.findById(req.params.id);
  if (user) {
    res.status(200).json({
      status: true,
      user: {
        name: user.name,
      },
    });
  } else {
    next(new AppError(404, "User not found!"));
  }
});
export const updateUser = catchAsync(async function updateUser(
  req: Request,
  res: Response
): Promise<any> {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: true,
    data: null,
  });
});
export const createUser = catchAsync(async function createUser(
  req: Request,
  res: Response
): Promise<any> {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: true,
    data: newUser,
  });
});

export const deleteUser = catchAsync(async function deleteUser(
  req: Request,
  res: Response
): Promise<any> {
  await User.findByIdAndDelete(req.user._id, { active: false });
  res.status(204).json({
    status: true,
    data: null,
  });
});
