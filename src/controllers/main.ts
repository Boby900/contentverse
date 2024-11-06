import { Response, Request, NextFunction } from "express";

export const getHome = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello World!')
}
export const likePost = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello like')
}
export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello delete!')
}
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello create!')
}

