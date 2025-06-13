import { Router } from "express";
import { edgeComputingService, } from "../edge-computing.api";
const router = Router();
// Edge Device Management Routes
router.get("/devices", async (req, res) => {
    try {
        const devices = await edgeComputingService.getAllDevices();
        res.json(devices);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch edge devices" });
    }
});
router.get("/devices/:deviceId", async (req, res) => {
    try {
        const device = await edgeComputingService.getDevice(req.params.deviceId);
        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }
        res.json(device);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch device" });
    }
});
router.post("/devices", async (req, res) => {
    try {
        const device = await edgeComputingService.registerDevice(req.body);
        res.status(201).json(device);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to register device" });
    }
});
router.put("/devices/:deviceId/status", async (req, res) => {
    try {
        await edgeComputingService.updateDeviceStatus(req.params.deviceId, req.body.status);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update device status" });
    }
});
router.post("/devices/:deviceId/optimize", async (req, res) => {
    try {
        const success = await edgeComputingService.optimizeDevice(req.params.deviceId);
        res.json({ success });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to optimize device" });
    }
});
// Edge Workload Management Routes
router.get("/workloads", async (req, res) => {
    try {
        const workloads = await edgeComputingService.getAllWorkloads();
        res.json(workloads);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch workloads" });
    }
});
router.post("/workloads", async (req, res) => {
    try {
        const workload = await edgeComputingService.createWorkload(req.body);
        res.status(201).json(workload);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create workload" });
    }
});
router.get("/workloads/:workloadId", async (req, res) => {
    try {
        const workload = await edgeComputingService.getWorkload(req.params.workloadId);
        if (!workload) {
            return res.status(404).json({ error: "Workload not found" });
        }
        res.json(workload);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch workload" });
    }
});
// Conflict Resolution Routes
router.get("/conflicts", async (req, res) => {
    try {
        const conflicts = await edgeComputingService.detectConflicts();
        res.json(conflicts);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to detect conflicts" });
    }
});
router.post("/conflicts/:conflictId/resolve", async (req, res) => {
    try {
        const success = await edgeComputingService.resolveConflict(req.params.conflictId);
        res.json({ success });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to resolve conflict" });
    }
});
// Cache Management Routes
router.post("/cache", async (req, res) => {
    try {
        const { key, data, options } = req.body;
        await edgeComputingService.cacheData(key, data, options);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to cache data" });
    }
});
router.get("/cache/:key", async (req, res) => {
    try {
        const data = await edgeComputingService.getCachedData(req.params.key);
        if (data === null) {
            return res.status(404).json({ error: "Cache entry not found" });
        }
        res.json({ data });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve cached data" });
    }
});
router.delete("/cache/:pattern", async (req, res) => {
    try {
        const invalidatedCount = await edgeComputingService.invalidateCache(req.params.pattern);
        res.json({ invalidatedCount });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to invalidate cache" });
    }
});
// Analytics and Dashboard Routes
router.get("/analytics", async (req, res) => {
    try {
        const analytics = await edgeComputingService.getEdgeAnalytics();
        res.json(analytics);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch edge analytics" });
    }
});
router.get("/dashboard", async (req, res) => {
    try {
        const dashboardData = await edgeComputingService.getEdgeComputingDashboard();
        res.json(dashboardData);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
});
// Health Check Route
router.get("/health", async (req, res) => {
    try {
        const devices = await edgeComputingService.getAllDevices();
        const healthyDevices = devices.filter((d) => d.status === "online").length;
        const totalDevices = devices.length;
        res.json({
            status: "healthy",
            totalDevices,
            healthyDevices,
            uptime: totalDevices > 0 ? (healthyDevices / totalDevices) * 100 : 0,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Health check failed" });
    }
});
export default router;
