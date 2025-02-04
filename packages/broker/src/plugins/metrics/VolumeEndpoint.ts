import express, { Request, Response, Router } from 'express'
import { MetricsContext } from 'streamr-network'
import { LEGACY_API_ROUTE_PREFIX } from '../../httpServer'

/**
 * Endpoint for GETing volume metrics
 */
export const router = (metricsContext: MetricsContext): Router => {
    if (!metricsContext) {
        throw new Error('metricsContext not given!')
    }

    const router = express.Router()

    router.get(`${LEGACY_API_ROUTE_PREFIX}/volume`, async (req: Request, res: Response) => {
        const report = await metricsContext.report()
        res.status(200).send(report)
    })

    return router
}
