import { Response, Request, NextFunction } from "express";

export const getHome = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).json({message:'Hello World!'})}


export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).json({message:'Hello Dashboard!'})
}

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).json({message:'Hello Profile!'})}
