import { Response, Request, NextFunction } from "express";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello user!')
}
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello like')
}

