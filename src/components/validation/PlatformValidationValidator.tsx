// Replace this 

   }, [categories]); 

 // with 

   }, [categories, healthChecks, criticalAlerts, toast, healthTrends, isRealTimeMonitoring]);

  // Auto-fix functionality
  const handleAutoFix = useCallback(async (checkId: string) => {
    const check = healthChecks.find(c => c.id === checkId);
    if (!check || !check.autoFixAvailable) return;

    setAutoFixInProgress(prev => new Set([...prev, checkId]));
    
    try {
      // Simulate auto-fix process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Auto-Fix Complete",
        description: `Successfully fixed: ${check.name}`,
        variant: "success",
      });
      
      // Trigger re-validation
      runPlatformValidation();
    } catch (error) {
      toast({
        title: "Auto-Fix Failed",
        description: `Failed to fix: ${check.name}`,
        variant: "destructive",
      });
    } finally {
      setAutoFixInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(checkId);
        return newSet;
      });
    }
  }, [healthChecks, toast, runPlatformValidation]);

  // Toggle real-time monitoring
  const toggleRealTimeMonitoring = useCallback(() => {
    setIsRealTimeMonitoring(prev => {
      const newValue = !prev;
      toast({
        title: newValue ? "Real-time Monitoring Enabled" : "Real-time Monitoring Disabled",
        description: newValue ? "Platform will be monitored every 30 seconds" : "Monitoring stopped",
        variant: "success",
      });
      return newValue;
    });
  }, [toast]);