import { Router, type IRouter } from "express";
import healthRouter from "./health";
import soilRouter from "./soil";

const router: IRouter = Router();

router.use(healthRouter);
router.use(soilRouter);

export default router;
