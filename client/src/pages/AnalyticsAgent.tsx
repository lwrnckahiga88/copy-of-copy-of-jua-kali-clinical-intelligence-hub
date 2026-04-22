import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, PieChart, LineChart } from "lucide-react";

/**
 * Analytics Agent
 * Displays predictive analytics, trends, and clinical insights
 */
export default function AnalyticsAgent() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedMetric, setSelectedMetric] = useState("admissions");

  const metrics = [
    { id: "admissions", label: "Admissions", value: 342, trend: 12, unit: "patients" },
    { id: "readmissions", label: "Readmissions", value: 28, trend: -5, unit: "%" },
    { id: "avgLOS", label: "Avg Length of Stay", value: 4.2, trend: -2, unit: "days" },
    { id: "mortality", label: "Mortality Rate", value: 2.1, trend: -0.5, unit: "%" },
  ];

  const currentMetric = metrics.find((m) => m.id === selectedMetric);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 font-mono">Analytics</h1>
          <p className="text-slate-400 mt-2">
            Predictive analytics, trends, and clinical insights
          </p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`bg-slate-900/50 border-cyan-500/30 cursor-pointer transition-all ${
              selectedMetric === metric.id ? "border-cyan-500 bg-cyan-600/10" : "hover:border-cyan-500/50"
            }`}
          >
            <div className="p-4">
              <div className="text-sm text-slate-400 mb-2">{metric.label}</div>
              <div className="text-2xl font-bold text-cyan-400">
                {metric.value}
              </div>
              <div className="text-xs text-slate-500 mt-1">{metric.unit}</div>
              <div className={`text-sm mt-2 ${metric.trend >= 0 ? "text-red-400" : "text-green-400"}`}>
                {metric.trend >= 0 ? "↑" : "↓"} {Math.abs(metric.trend)}%
              </div>
            </div>
          </Card>
        ))}
      </div>

      {currentMetric && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-cyan-500/30">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                {currentMetric.label} Trend
              </h3>
              <div className="h-64 bg-slate-800/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization</p>
                  <p className="text-sm mt-1">Time range: {timeRange}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Insights */}
          <Card className="bg-slate-900/50 border-cyan-500/30">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Insights
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-slate-100 mb-1">
                    Key Finding
                  </div>
                  <div className="text-sm text-slate-400">
                    {currentMetric.trend >= 0
                      ? `${currentMetric.label} increased by ${Math.abs(currentMetric.trend)}%`
                      : `${currentMetric.label} decreased by ${Math.abs(currentMetric.trend)}%`}
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-slate-100 mb-1">
                    Recommendation
                  </div>
                  <div className="text-sm text-slate-400">
                    Review current protocols and compare with peer institutions
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Distribution */}
      <Card className="bg-slate-900/50 border-cyan-500/30">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Distribution by Department
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Emergency", value: 35, color: "bg-red-500/20 border-red-500" },
              { name: "ICU", value: 28, color: "bg-orange-500/20 border-orange-500" },
              { name: "Surgery", value: 22, color: "bg-yellow-500/20 border-yellow-500" },
              { name: "General", value: 15, color: "bg-green-500/20 border-green-500" },
            ].map((dept) => (
              <div
                key={dept.name}
                className={`p-4 rounded-lg border ${dept.color}`}
              >
                <div className="text-sm text-slate-400">{dept.name}</div>
                <div className="text-2xl font-bold text-cyan-400 mt-2">
                  {dept.value}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Predictive Models */}
      <Card className="bg-slate-900/50 border-cyan-500/30">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Predictive Models
          </h3>
          <div className="space-y-4">
            {[
              { name: "Readmission Risk", accuracy: 92, status: "Active" },
              { name: "Length of Stay", accuracy: 88, status: "Active" },
              { name: "Mortality Prediction", accuracy: 85, status: "Training" },
              { name: "Resource Allocation", accuracy: 79, status: "Active" },
            ].map((model) => (
              <div key={model.name} className="bg-slate-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-100">{model.name}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      model.status === "Active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {model.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: `${model.accuracy}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-400">{model.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
