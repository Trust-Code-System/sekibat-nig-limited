import type { RequestHandler } from "express";
import { AppError } from "../util/app-error.js";

export const notFound: RequestHandler = (_request, _response, next) => {
  next(AppError.notFound("Route not found."));
};
