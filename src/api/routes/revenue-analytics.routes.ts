import express from "express";
import {
  // Claims Processing APIs
  processClaimSubmission,
  getClaimStatus,
  getClaimsProcessingAnalytics,

  // Daman Integration APIs
  submitDamanAuthorization,
  getDamanAuthorizationStatus,
  verifyDamanEligibility,

  // Authorization Intelligence APIs
  generateAuthorizationPrediction,
  getAuthorizationIntelligenceAnalytics,

  // Payment Reconciliation APIs
  getPaymentReconciliation,
  processPaymentReconciliation,
  getPaymentReconciliationAnalytics,

  // Revenue Analytics APIs
  getRevenueAnalyticsDashboard,
  generateSmartClaimsAnalytics,
  generatePaymentPrediction,
  createServiceMixOptimization,
  generateRevenueIntelligenceReport,
} from "../revenue-analytics.api";

const router = express.Router();

// Claims Processing Routes

/**
 * @route POST /api/revenue/claims/process
 * @desc Process claim submission with automated validation
 * @access Private
 */
router.post("/claims/process", async (req, res) => {
  try {
    const result = await processClaimSubmission(req.body);
    res.json(result);
  } catch (error) {
    console.error("Claims processing error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process claim",
    });
  }
});

/**
 * @route GET /api/revenue/claims/:trackingId/status
 * @desc Get claim status and tracking information
 * @access Private
 */
router.get("/claims/:trackingId/status", async (req, res) => {
  try {
    const { trackingId } = req.params;
    const result = await getClaimStatus(trackingId);
    res.json(result);
  } catch (error) {
    console.error("Get claim status error:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to get claim status",
    });
  }
});

/**
 * @route GET /api/revenue/claims/analytics
 * @desc Get claims processing analytics
 * @access Private
 */
router.get("/claims/analytics", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const result = await getClaimsProcessingAnalytics(
      dateFrom as string,
      dateTo as string,
    );
    res.json(result);
  } catch (error) {
    console.error("Claims analytics error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to get claims analytics",
    });
  }
});

// Daman Integration Routes

/**
 * @route POST /api/revenue/daman/authorization/submit
 * @desc Submit Daman authorization request
 * @access Private
 */
router.post("/daman/authorization/submit", async (req, res) => {
  try {
    const result = await submitDamanAuthorization(req.body);
    res.json(result);
  } catch (error) {
    console.error("Daman authorization submission error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to submit Daman authorization",
    });
  }
});

/**
 * @route GET /api/revenue/daman/authorization/:trackingNumber/status
 * @desc Get Daman authorization status
 * @access Private
 */
router.get("/daman/authorization/:trackingNumber/status", async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const result = await getDamanAuthorizationStatus(trackingNumber);
    res.json(result);
  } catch (error) {
    console.error("Daman authorization status error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to get Daman authorization status",
    });
  }
});

/**
 * @route POST /api/revenue/daman/eligibility/verify
 * @desc Verify real-time Daman eligibility
 * @access Private
 */
router.post("/daman/eligibility/verify", async (req, res) => {
  try {
    const result = await verifyDamanEligibility(req.body);
    res.json(result);
  } catch (error) {
    console.error("Daman eligibility verification error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to verify Daman eligibility",
    });
  }
});

// Authorization Intelligence Routes

/**
 * @route POST /api/revenue/authorization/prediction
 * @desc Generate authorization prediction using AI
 * @access Private
 */
router.post("/authorization/prediction", async (req, res) => {
  try {
    const result = await generateAuthorizationPrediction(req.body);
    res.json(result);
  } catch (error) {
    console.error("Authorization prediction error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate authorization prediction",
    });
  }
});

/**
 * @route GET /api/revenue/authorization/analytics
 * @desc Get authorization intelligence analytics
 * @access Private
 */
router.get("/authorization/analytics", async (req, res) => {
  try {
    const result = await getAuthorizationIntelligenceAnalytics();
    res.json(result);
  } catch (error) {
    console.error("Authorization intelligence analytics error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to get authorization intelligence analytics",
    });
  }
});

// Payment Reconciliation Routes

/**
 * @route GET /api/revenue/reconciliation
 * @desc Get payment reconciliation data
 * @access Private
 */
router.get("/reconciliation", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const result = await getPaymentReconciliation(
      dateFrom as string,
      dateTo as string,
    );
    res.json(result);
  } catch (error) {
    console.error("Payment reconciliation error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to get payment reconciliation data",
    });
  }
});

/**
 * @route POST /api/revenue/reconciliation/process
 * @desc Process payment reconciliation
 * @access Private
 */
router.post("/reconciliation/process", async (req, res) => {
  try {
    const result = await processPaymentReconciliation(req.body);
    res.json(result);
  } catch (error) {
    console.error("Process payment reconciliation error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to process payment reconciliation",
    });
  }
});

/**
 * @route GET /api/revenue/reconciliation/analytics
 * @desc Get payment reconciliation analytics
 * @access Private
 */
router.get("/reconciliation/analytics", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const result = await getPaymentReconciliationAnalytics(
      dateFrom as string,
      dateTo as string,
    );
    res.json(result);
  } catch (error) {
    console.error("Payment reconciliation analytics error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to get payment reconciliation analytics",
    });
  }
});

// Revenue Analytics Routes

/**
 * @route GET /api/revenue/dashboard
 * @desc Get comprehensive revenue analytics dashboard
 * @access Private
 */
router.get("/dashboard", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const result = await getRevenueAnalyticsDashboard(
      dateFrom as string,
      dateTo as string,
    );
    res.json(result);
  } catch (error) {
    console.error("Revenue analytics dashboard error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to get revenue analytics dashboard",
    });
  }
});

/**
 * @route POST /api/revenue/claims/smart-analytics
 * @desc Generate smart claims analytics
 * @access Private
 */
router.post("/claims/smart-analytics", async (req, res) => {
  try {
    const result = await generateSmartClaimsAnalytics(req.body);
    res.json(result);
  } catch (error) {
    console.error("Smart claims analytics error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate smart claims analytics",
    });
  }
});

/**
 * @route POST /api/revenue/payments/prediction
 * @desc Generate payment prediction
 * @access Private
 */
router.post("/payments/prediction", async (req, res) => {
  try {
    const result = await generatePaymentPrediction(req.body);
    res.json(result);
  } catch (error) {
    console.error("Payment prediction error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate payment prediction",
    });
  }
});

/**
 * @route POST /api/revenue/service-mix/optimize
 * @desc Create service mix optimization
 * @access Private
 */
router.post("/service-mix/optimize", async (req, res) => {
  try {
    const { currentMix, constraints } = req.body;
    const result = await createServiceMixOptimization(currentMix, constraints);
    res.json(result);
  } catch (error) {
    console.error("Service mix optimization error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to create service mix optimization",
    });
  }
});

/**
 * @route POST /api/revenue/intelligence/report
 * @desc Generate comprehensive revenue intelligence report
 * @access Private
 */
router.post("/intelligence/report", async (req, res) => {
  try {
    const result = await generateRevenueIntelligenceReport(req.body);
    res.json(result);
  } catch (error) {
    console.error("Revenue intelligence report error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate revenue intelligence report",
    });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      claimsProcessing: "operational",
      damanIntegration: "operational",
      authorizationIntelligence: "operational",
      paymentReconciliation: "operational",
      revenueAnalytics: "operational",
    },
  });
});

export default router;
