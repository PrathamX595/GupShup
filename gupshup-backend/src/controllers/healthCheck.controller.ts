import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";

const healthCheck = async (req: Request, res: Response)=>{
    return res.status(200).json(new ApiResponse(200, "OK", "Health check passes"));
}

export default healthCheck

