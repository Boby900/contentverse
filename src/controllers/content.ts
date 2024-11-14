import { Response, Request, NextFunction } from "express";
import { db } from "../db";
import { contentTable } from "../db/schema";
import {randomUUID} from "crypto";




export const createContent = async (req: Request, res: Response, next: NextFunction) => {
  
    const { title, userId} = req.body;    

    const data = await db.insert(contentTable).values({
        id: randomUUID(),      // Generate a unique ID
        title: title,
        userId: userId
       
        
    })
    res.status(201).send('Hello createContent!')
}


export const getAllContent = async (req: Request, res: Response, next: NextFunction) => {
    
    const data = await db.select().from(contentTable);
    
    console.log(data)
    res.status(201).send('Hello getAllContent!')
}


export const getContentByID = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello getContentByID!')
}

export const updateContentByID = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello updateContentByID!')
}
export const deleteContentByID = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    res.status(201).send('Hello deleteContentByID!')
}


