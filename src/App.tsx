import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

// Core Healthcare Components
import Dashboard from '@/components/core/Dashboard';
import PatientManagement from '@/components/patient/PatientManagement';
import ClinicalForms from '@/components/clinical/ClinicalForms';
import DOHCompliance from '@/components/compliance/DOHCompliance';
import LoginForm from '@/components/auth/LoginForm';

function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/patients" element={<PatientManagement />} />
        <Route path="/clinical" element={<ClinicalForms />} />
        <Route path="/compliance" element={<DOHCompliance />} />
      </Routes>
      
      <Toaster />
    </TooltipProvider>
  );
}

export default App;