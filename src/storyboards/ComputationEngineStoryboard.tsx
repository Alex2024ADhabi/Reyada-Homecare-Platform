import React, { useState, useEffect } from "react";
import { smartComputationEngine } from "@/engines/computation.engine";

export default function ComputationEngineStoryboard() {
  const [engineStats, setEngineStats] = useState<any>(null);
  const [taskResults, setTaskResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskType, setTaskType] = useState("calculation");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [isRunningTask, setIsRunningTask] = useState(false);

  useEffect(() => {
    const initializeEngine = async () => {
      try {
        await smartComputationEngine.initialize();
        updateStats();
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize engine:", error);
        setIsLoading(false);
      }
    };

    initializeEngine();

    // Update stats every 2 seconds
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    const stats = smartComputationEngine.getStats();
    const metrics = smartComputationEngine.getPerformanceMetrics();
    setEngineStats({ ...stats, ...metrics });

    // Get latest task results
    const results = smartComputationEngine.getAllResults();
    setTaskResults(results.slice(-10).reverse()); // Show last 10 tasks
  };

  const runTask = async () => {
    setIsRunningTask(true);
    try {
      const taskId = await smartComputationEngine.executeTask({
        name: `Demo ${taskType} task`,
        type: taskType as any,
        priority: taskPriority as any,
        input: { demoData: true, timestamp: Date.now() },
        parameters: {
          demo: true,
          complexity: taskType === "optimization" ? "high" : "medium",
        },
        dependencies: [],
        timeout: 10000,
        retryPolicy: {
          maxRetries: 2,
          retryDelay: 1000,
          exponentialBackoff: true,
        },
      });

      // Wait a bit for task to process
      setTimeout(() => {
        updateStats();
        setIsRunningTask(false);
      }, 1000);
    } catch (error) {
      console.error("Task execution failed:", error);
      setIsRunningTask(false);
    }
  };

  const clearCache = () => {
    smartComputationEngine.clearCache();
    updateStats();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-lg">Initializing Computation Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Smart Computation Engine Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Engine Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Engine Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-medium">
                  {engineStats?.isInitialized ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Uptime</p>
                <p className="text-lg font-medium">
                  {engineStats?.uptime
                    ? `${Math.floor(engineStats.uptime / 60)} min`
                    : "N/A"}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-lg font-medium">
                  {engineStats?.successRate
                    ? `${engineStats.successRate.toFixed(1)}%`
                    : "N/A"}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Cache Hit Rate</p>
                <p className="text-lg font-medium">
                  {engineStats?.cacheHitRate
                    ? `${engineStats.cacheHitRate.toFixed(1)}%`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Task Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Completed Tasks</p>
                <p className="text-lg font-medium">
                  {engineStats?.completedTasks || 0}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Failed Tasks</p>
                <p className="text-lg font-medium">
                  {engineStats?.failedTasks || 0}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Queue Length</p>
                <p className="text-lg font-medium">
                  {engineStats?.queueLength || 0}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Avg. Execution Time</p>
                <p className="text-lg font-medium">
                  {engineStats?.averageExecutionTime
                    ? `${engineStats.averageExecutionTime.toFixed(1)}ms`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Resource Utilization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Usage */}
            <div>
              <p className="text-sm text-gray-500 mb-1">CPU Usage</p>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${engineStats?.cpuUsage || 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">
                {engineStats?.cpuUsage?.toFixed(1) || 0}%
              </p>
            </div>

            {/* Memory Usage */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Memory Usage</p>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600"
                  style={{
                    width: `${(engineStats?.memoryUsage / (engineStats?.peakMemoryUsage || 1)) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">
                {(engineStats?.memoryUsage / 1024 / 1024).toFixed(2) || 0} MB
              </p>
            </div>

            {/* Worker Utilization */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Worker Utilization</p>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600"
                  style={{ width: `${engineStats?.workerUtilization || 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">
                {engineStats?.activeWorkers || 0}/
                {engineStats?.totalWorkers || 0} workers
              </p>
            </div>
          </div>
        </div>

        {/* Task Execution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Task Runner */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Run Test Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  disabled={isRunningTask}
                >
                  <option value="calculation">Calculation</option>
                  <option value="analysis">Analysis</option>
                  <option value="prediction">Prediction</option>
                  <option value="optimization">Optimization</option>
                  <option value="validation">Validation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  disabled={isRunningTask}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="pt-2">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                  onClick={runTask}
                  disabled={isRunningTask}
                >
                  {isRunningTask ? "Running..." : "Run Task"}
                </button>
              </div>
              <div className="pt-2">
                <button
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
                  onClick={clearCache}
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6 overflow-hidden">
            <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time (ms)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {taskResults.length > 0 ? (
                    taskResults.map((task) => (
                      <tr key={task.taskId}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {task.taskId.substring(0, 8)}...
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {task.status === "completed" ? (
                            <span className="text-green-600 font-medium">
                              Completed
                            </span>
                          ) : task.status === "failed" ? (
                            <span className="text-red-600 font-medium">
                              Failed
                            </span>
                          ) : (
                            <span className="text-yellow-600 font-medium">
                              {task.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {task.metadata?.taskType || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {task.executionTime || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {task.metadata?.priority === "critical" ? (
                            <span className="text-red-600 font-medium">
                              Critical
                            </span>
                          ) : task.metadata?.priority === "high" ? (
                            <span className="text-orange-600 font-medium">
                              High
                            </span>
                          ) : task.metadata?.priority === "medium" ? (
                            <span className="text-blue-600 font-medium">
                              Medium
                            </span>
                          ) : (
                            <span className="text-gray-600 font-medium">
                              Low
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-4 text-sm text-center text-gray-500"
                      >
                        No tasks executed yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
