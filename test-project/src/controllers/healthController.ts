import { Request, Response } from 'express';

/**
* Health check controller
*/
class HealthController {
    /**
    * Check server health
    */
    check(req: Request, res: Response) {
        res.status(200).json({
            status: 'ok',
            message: 'TestProject API is running',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    }
}

export default new HealthController();
