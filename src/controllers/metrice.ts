import { db } from "../db/index.js";
import { ipFailureTable } from "../db/schema.js";
import { Response, Request, NextFunction } from "express";


// Fetch the data from the IP failure table
export const getMetrics =  async (req: Request, res: Response)=>{
    try {
        // Query to fetch all data from the ipFailureTable
        const ipData = await db
          .select()
          .from(ipFailureTable);
    
        // Check if any data was retrieved
        if (ipData.length === 0) {
           res.status(404).json({ message: 'No IP data found' });
           return
        }
    
        // Send the data back to the client
        res.status(200).json({ ipData });
      } catch (error) {
        console.error('Error fetching IP metrics:', error);
        res.status(500).json({ error: 'Unable to fetch IP metrics' });
      }
}