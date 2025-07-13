import React from 'react';
import { Routes, Route, useRoutes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

// Core Healthcare Components
import Dashboard from '@/components/core/Dashboard';
import PatientManagement from '@/components/patient/PatientManagement';
import ClinicalForms from '@/components/clinical/ClinicalForms';
import DOHCompliance from '@/components/compliance/DOHCompliance';
import LoginForm from '@/components/auth/LoginForm';
import PlatformOverview from '@/components/overview/PlatformOverview';
import ProductionReadinessDashboard from '@/components/core/ProductionReadinessDashboard';
import DeploymentGuide from '@/components/deployment/DeploymentGuide';
import DOHNineDomainsValidator from '@/components/compliance/DOHNineDomainsValidator';

// Enhanced Max Mode Components
import CompleteDOHNineDomainsValidator from '@/components/compliance/CompleteDOHNineDomainsValidator';
import AdvancedPerformanceOptimizationEngine from '@/components/performance/AdvancedPerformanceOptimizationEngine';
import MasterPlatformCompletionDashboard from '@/components/master/MasterPlatformCompletionDashboard';

// NEW: Missing Module Components - 100% Implementation
import AdvancedPatientOutcomePrediction from '@/components/patient/AdvancedPatientOutcomePrediction';
import RealTimePatientMonitoringDashboard from '@/components/patient/RealTimePatientMonitoringDashboard';
import AdvancedClinicalDecisionSupport from '@/components/clinical/AdvancedClinicalDecisionSupport';
import AdvancedRevenueForecastingEngine from '@/components/revenue/AdvancedRevenueForecastingEngine';
import PredictiveManpowerPlanningSystem from '@/components/manpower/PredictiveManpowerPlanningSystem';
import AdvancedMobileOptimizationEngine from '@/components/mobile/AdvancedMobileOptimizationEngine';

// Enhanced Error Boundary
import EnhancedStoryboardErrorBoundary, { setupGlobalStoryboardErrorHandler } from '@/components/common/EnhancedStoryboardErrorBoundary';

// Setup global error handling
setupGlobalStoryboardErrorHandler();

// Enhanced storyboard error recovery
let routes: any = null;
try {
  // @ts-ignore
  routes = require("tempo-routes").default;
} catch (error) {
  console.warn('Tempo routes not available, continuing without storyboard support');
  routes = null;
}

function App() {
  return (
    <EnhancedStoryboardErrorBoundary>
      <TooltipProvider>
        {/* Tempo routes with enhanced error recovery */}
        {import.meta.env.VITE_TEMPO && routes && useRoutes(routes)}
        
        <Routes>
          <Route path="/" element={<MasterPlatformCompletionDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginForm />} />
          
          {/* Patient Management Routes */}
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/patient-outcomes" element={<AdvancedPatientOutcomePrediction />} />
          <Route path="/patient-monitoring" element={<RealTimePatientMonitoringDashboard />} />
          
          {/* Clinical Operations Routes */}
          <Route path="/clinical" element={<ClinicalForms />} />
          <Route path="/clinical-decision-support" element={<AdvancedClinicalDecisionSupport />} />
          
          {/* Revenue Management Routes */}
          <Route path="/revenue-forecasting" element={<AdvancedRevenueForecastingEngine />} />
          
          {/* Manpower Management Routes */}
          <Route path="/manpower-planning" element={<PredictiveManpowerPlanningSystem />} />
          
          {/* Mobile & PWA Routes */}
          <Route path="/mobile-optimization" element={<AdvancedMobileOptimizationEngine />} />
          
          {/* Compliance Routes */}
          <Route path="/compliance" element={<DOHCompliance />} />
          <Route path="/doh-validator" element={<DOHNineDomainsValidator />} />
          <Route path="/doh-complete-validator" element={<CompleteDOHNineDomainsValidator />} />
          
          {/* Performance & Analytics Routes */}
          <Route path="/performance-engine" element={<AdvancedPerformanceOptimizationEngine />} />
          <Route path="/master-completion" element={<MasterPlatformCompletionDashboard />} />
          <Route path="/platform-overview" element={<PlatformOverview />} />
          <Route path="/production" element={<ProductionReadinessDashboard />} />
          <Route path="/deployment" element={<DeploymentGuide />} />
          
          {/* Add tempo route fallback */}
          {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
        </Routes>
        
        <Toaster />
      </TooltipProvider>
    </EnhancedStoryboardErrorBoundary>
  );
}

export default App;