import { Response, Request, NextFunction } from "express";

export const getAllContent = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello getAllContent!')
}
export const getContentByID = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello getContentByID!')
}
export const createContent = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello createContent!')
}
export const updateContentByID = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello updateContentByID!')
}
export const deleteContentByID = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello deleteContentByID!')
}


