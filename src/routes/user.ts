import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} from "../controller/user";

import { allow, protect } from "@dripstore/common/build";

const router = express.Router();

router.route("/user").get(getAllUsers).post(createUser);

router
  .route("/user/:id")
  .get(getUser)
  .patch(protect, allow(["admin"]), updateUser)
  .delete(protect, allow(["admin"]), deleteUser);

export default router;
