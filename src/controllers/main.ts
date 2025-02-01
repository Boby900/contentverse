import { Response, Request, NextFunction } from "express";

export const getHome = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({ message: "Hello World!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};

export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

    try {
        res.status(200).json({ message: "Hello Dashboard!" });
        
    } catch (error) {
        console.error(error);
        res
          .status(404)
          .json({ error: "Something went wrong. Please try again later." });
    }

};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    try {
        res.status(200).json({ message: "Hello Profile!" });
        
    } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "Something went wrong. Please try again later." });
    }

};
