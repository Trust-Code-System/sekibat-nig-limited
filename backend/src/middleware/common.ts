import express from "express";
import helmet from "helmet";

export const securityHeaders = helmet();
export const jsonBody = express.json({ limit: "100kb" });
