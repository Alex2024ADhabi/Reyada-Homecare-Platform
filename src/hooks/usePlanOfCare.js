import { useState, useEffect, useCallback } from "react";
import planOfCareService from "../services/planOfCare.service";
import { useOfflineSync } from "./useOfflineSync";
export function usePlanOfCare({ patientId, planId } = {}) {
    const [plan, setPlan] = useState(null);
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isOnline, saveFormData } = useOfflineSync();
    // Fetch a specific plan of care
    const fetchPlan = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await planOfCareService.getPlanOfCare(id);
            setPlan(data);
        }
        catch (err) {
            console.error("Error fetching plan of care:", err);
            setError("Failed to load plan of care. Please try again later.");
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Fetch all plans for a patient
    const fetchPatientPlans = useCallback(async (patientId) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await planOfCareService.getPatientPlansOfCare(patientId);
            setPlans(data);
        }
        catch (err) {
            console.error("Error fetching patient plans of care:", err);
            setError("Failed to load plans of care. Please try again later.");
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Create a new plan of care
    const createPlan = async (planData) => {
        setIsLoading(true);
        setError(null);
        try {
            const newPlan = await planOfCareService.createPlanOfCare(planData);
            // Update the local state
            if (patientId === planData.patientId) {
                setPlans((prevPlans) => [newPlan, ...prevPlans]);
            }
            return newPlan;
        }
        catch (err) {
            console.error("Error creating plan of care:", err);
            setError("Failed to create plan of care. Please try again later.");
            return null;
        }
        finally {
            setIsLoading(false);
        }
    };
    // Update an existing plan of care
    const updatePlan = async (id, planData) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedPlan = await planOfCareService.updatePlanOfCare(id, planData);
            // Update the local state
            if (updatedPlan) {
                if (plan && plan.id === id) {
                    setPlan(updatedPlan);
                }
                if (plans.length > 0) {
                    setPlans((prevPlans) => prevPlans.map((p) => (p.id === id ? updatedPlan : p)));
                }
            }
            return updatedPlan;
        }
        catch (err) {
            console.error("Error updating plan of care:", err);
            setError("Failed to update plan of care. Please try again later.");
            return null;
        }
        finally {
            setIsLoading(false);
        }
    };
    // Update plan status
    const updatePlanStatus = async (id, status, notes) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedPlan = await planOfCareService.updatePlanStatus(id, status, notes);
            // Update the local state
            if (updatedPlan) {
                if (plan && plan.id === id) {
                    setPlan(updatedPlan);
                }
                if (plans.length > 0) {
                    setPlans((prevPlans) => prevPlans.map((p) => (p.id === id ? updatedPlan : p)));
                }
            }
            return updatedPlan;
        }
        catch (err) {
            console.error("Error updating plan status:", err);
            setError("Failed to update plan status. Please try again later.");
            return null;
        }
        finally {
            setIsLoading(false);
        }
    };
    // Mark nursing input as completed
    const markNursingInputCompleted = async (id, nurseId) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedPlan = await planOfCareService.markNursingInputCompleted(id, nurseId);
            // Update the local state
            if (updatedPlan) {
                if (plan && plan.id === id) {
                    setPlan(updatedPlan);
                }
                if (plans.length > 0) {
                    setPlans((prevPlans) => prevPlans.map((p) => (p.id === id ? updatedPlan : p)));
                }
            }
            return updatedPlan;
        }
        catch (err) {
            console.error("Error marking nursing input as completed:", err);
            setError("Failed to update nursing input. Please try again later.");
            return null;
        }
        finally {
            setIsLoading(false);
        }
    };
    // Mark physician review as completed
    const markPhysicianReviewCompleted = async (id, physicianId, approvalStatus, comments) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedPlan = await planOfCareService.markPhysicianReviewCompleted(id, physicianId, approvalStatus, comments);
            // Update the local state
            if (updatedPlan) {
                if (plan && plan.id === id) {
                    setPlan(updatedPlan);
                }
                if (plans.length > 0) {
                    setPlans((prevPlans) => prevPlans.map((p) => (p.id === id ? updatedPlan : p)));
                }
            }
            return updatedPlan;
        }
        catch (err) {
            console.error("Error marking physician review as completed:", err);
            setError("Failed to update physician review. Please try again later.");
            return null;
        }
        finally {
            setIsLoading(false);
        }
    };
    // Save plan of care (works both online and offline)
    const savePlanOfCare = async (planData) => {
        try {
            if (planData.id) {
                // Update existing plan
                return await updatePlan(planData.id, planData);
            }
            else {
                // Create new plan
                return await createPlan(planData);
            }
        }
        catch (err) {
            console.error("Error saving plan of care:", err);
            setError("Failed to save plan of care. Please try again later.");
            return null;
        }
    };
    // Load initial data
    useEffect(() => {
        if (planId) {
            fetchPlan(planId);
        }
        else if (patientId) {
            fetchPatientPlans(patientId);
        }
    }, [planId, patientId, fetchPlan, fetchPatientPlans]);
    return {
        plan,
        plans,
        isLoading,
        error,
        isOnline,
        fetchPlan,
        fetchPatientPlans,
        createPlan,
        updatePlan,
        updatePlanStatus,
        markNursingInputCompleted,
        markPhysicianReviewCompleted,
        savePlanOfCare,
    };
}
