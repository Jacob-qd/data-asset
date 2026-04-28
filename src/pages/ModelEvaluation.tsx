import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, TrendingUp, Target, Crosshair, BarChart3,
  Activity, Gauge, Download
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import * as echarts from "echarts";

interface EvaluationMetrics {
  auc: number;
  ks: number;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

export default function ModelEvaluation() {
  const navigate = useNavigate();
  const { modelId } = useParams();
  const [threshold, setThreshold] = useState(0.5);
  const [metrics, setMetrics] = useState<EvaluationMetrics>({
    auc: 0.9234,
    ks: 0.7345,
    precision: 0.8923,
    recall: 0.8456,
    f1Score: 0.8684,
    accuracy: 0.9123,
  });

  // Confusion matrix based on threshold
  const generateConfusionMatrix = (threshold: number) => {
    const baseTP = 850;
    const baseFP = 80;
    const baseTN = 820;
    const baseFN = 120;
    const factor = (threshold - 0.5) * 200;
    return {
      tp: Math.max(0, Math.round(baseTP - factor)),
      fp: Math.max(0, Math.round(baseFP + factor * 0.6)),
      tn: Math.max(0, Math.round(baseTN + factor * 0.4)),
      fn: Math.max(0, Math.round(baseFN + factor)),
    };
  };

  const cm = generateConfusionMatrix(threshold);

  // Chart refs
  const rocRef = useRef<HTMLDivElement>(null);
  const ksRef = useRef<HTMLDivElement>(null);
  const prRef = useRef<HTMLDivElement>(null);
  const accuracyRef = useRef<HTMLDivElement>(null);
  const liftRef = useRef<HTMLDivElement>(null);
  const gainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const charts: echarts.ECharts[] = [];

    // ROC Curve
    if (rocRef.current) {
      const chart = echarts.init(rocRef.current);
      const fpr = [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];
      const tpr = [0, 0.42, 0.65, 0.78, 0.85, 0.91, 0.94, 0.96, 0.98, 0.99, 1.0];
      chart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "10%", right: "5%", top: "10%", bottom: "15%" },
        xAxis: { type: "value", name: "假阳性率(FPR)", max: 1, min: 0 },
        yAxis: { type: "value", name: "真阳性率(TPR)", max: 1, min: 0 },
        series: [
          {
            name: "ROC曲线",
            type: "line",
            data: fpr.map((x, i) => [x, tpr[i]]),
            smooth: true,
            lineStyle: { color: "#6366f1", width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(99, 102, 241, 0.3)" },
                { offset: 1, color: "rgba(99, 102, 241, 0.05)" },
              ]),
            },
          },
          {
            name: "基准线",
            type: "line",
            data: [[0, 0], [1, 1]],
            lineStyle: { color: "#e5e7eb", type: "dashed" },
            symbol: "none",
          },
        ],
      });
      charts.push(chart);
    }

    // K-S Curve
    if (ksRef.current) {
      const chart = echarts.init(ksRef.current);
      const thresholds = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      const tprKs = [1.0, 0.98, 0.95, 0.91, 0.85, 0.78, 0.68, 0.55, 0.40, 0.22, 0];
      const fprKs = [1.0, 0.92, 0.82, 0.70, 0.55, 0.40, 0.28, 0.18, 0.10, 0.04, 0];
      chart.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: ["TPR", "FPR"], bottom: 0 },
        grid: { left: "10%", right: "5%", top: "10%", bottom: "20%" },
        xAxis: { type: "category", data: thresholds, name: "阈值" },
        yAxis: { type: "value", name: "累积分布", max: 1 },
        series: [
          {
            name: "TPR",
            type: "line",
            data: tprKs,
            smooth: true,
            lineStyle: { color: "#10b981" },
          },
          {
            name: "FPR",
            type: "line",
            data: fprKs,
            smooth: true,
            lineStyle: { color: "#ef4444" },
          },
        ],
      });
      charts.push(chart);
    }

    // Precision-Recall Curve
    if (prRef.current) {
      const chart = echarts.init(prRef.current);
      const recallData = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      const precisionData = [1.0, 0.98, 0.96, 0.94, 0.92, 0.90, 0.88, 0.86, 0.84, 0.82, 0.80];
      chart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "10%", right: "5%", top: "10%", bottom: "15%" },
        xAxis: { type: "value", name: "召回率", max: 1 },
        yAxis: { type: "value", name: "精确率", max: 1, min: 0.7 },
        series: [{
          type: "line",
          data: recallData.map((x, i) => [x, precisionData[i]]),
          smooth: true,
          lineStyle: { color: "#8b5cf6" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(139, 92, 246, 0.3)" },
              { offset: 1, color: "rgba(139, 92, 246, 0.05)" },
            ]),
          },
        }],
      });
      charts.push(chart);
    }

    // Accuracy Curve
    if (accuracyRef.current) {
      const chart = echarts.init(accuracyRef.current);
      const accThresholds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      const accuracies = [0.82, 0.85, 0.87, 0.89, 0.91, 0.90, 0.88, 0.85, 0.80];
      chart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "10%", right: "5%", top: "10%", bottom: "15%" },
        xAxis: { type: "category", data: accThresholds, name: "阈值" },
        yAxis: { type: "value", name: "准确率", max: 1, min: 0.7 },
        series: [{
          type: "line",
          data: accuracies,
          smooth: true,
          lineStyle: { color: "#f59e0b" },
          markPoint: {
            data: [{ type: "max", name: "最大值" }],
          },
        }],
      });
      charts.push(chart);
    }

    // Lift Curve
    if (liftRef.current) {
      const chart = echarts.init(liftRef.current);
      const percentiles = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const liftValues = [3.2, 2.8, 2.4, 2.1, 1.9, 1.7, 1.5, 1.3, 1.1, 1.0];
      chart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "10%", right: "5%", top: "10%", bottom: "15%" },
        xAxis: { type: "category", data: percentiles, name: "百分位(%)" },
        yAxis: { type: "value", name: "提升度", min: 0 },
        series: [{
          type: "bar",
          data: liftValues,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#06b6d4" },
              { offset: 1, color: "#22d3ee" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        }],
      });
      charts.push(chart);
    }

    // Gain Curve
    if (gainRef.current) {
      const chart = echarts.init(gainRef.current);
      const gainPercentiles = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const gainValues = [0, 35, 58, 72, 82, 88, 93, 96, 98, 99, 100];
      chart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "10%", right: "5%", top: "10%", bottom: "15%" },
        xAxis: { type: "value", name: "样本比例(%)", max: 100 },
        yAxis: { type: "value", name: "累积正例比例(%)", max: 100 },
        series: [
          {
            name: "增益曲线",
            type: "line",
            data: gainPercentiles.map((x, i) => [x, gainValues[i]]),
            smooth: true,
            lineStyle: { color: "#ec4899" },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(236, 72, 153, 0.3)" },
                { offset: 1, color: "rgba(236, 72, 153, 0.05)" },
              ]),
            },
          },
          {
            name: "基准线",
            type: "line",
            data: [[0, 0], [100, 100]],
            lineStyle: { color: "#e5e7eb", type: "dashed" },
            symbol: "none",
          },
        ],
      });
      charts.push(chart);
    }

    const handleResize = () => charts.forEach((c) => c.resize());
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      charts.forEach((c) => c.dispose());
    };
  }, [threshold]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/privacy/models")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">模型评估详情</h1>
            <p className="text-sm text-gray-500">模型ID: {modelId || "MODEL-001"} | 医疗影像筛查模型V1</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          下载评估报告
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "AUC值", value: metrics.auc, icon: <TrendingUp className="w-5 h-5 text-blue-500" />, color: "text-blue-600" },
          { label: "K-S值", value: metrics.ks, icon: <Activity className="w-5 h-5 text-green-500" />, color: "text-green-600" },
          { label: "精确率", value: metrics.precision, icon: <Target className="w-5 h-5 text-purple-500" />, color: "text-purple-600" },
          { label: "召回率", value: metrics.recall, icon: <Crosshair className="w-5 h-5 text-orange-500" />, color: "text-orange-600" },
          { label: "F1-Score", value: metrics.f1Score, icon: <Gauge className="w-5 h-5 text-indigo-500" />, color: "text-indigo-600" },
          { label: "准确率", value: metrics.accuracy, icon: <BarChart3 className="w-5 h-5 text-pink-500" />, color: "text-pink-600" },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{metric.label}</span>
                {metric.icon}
              </div>
              <div className={cn("text-2xl font-bold", metric.color)}>
                {(metric.value * 100).toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confusion Matrix + Threshold */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">混淆矩阵</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>分类阈值</span>
                <span className="font-medium">{threshold.toFixed(2)}</span>
              </div>
              <Slider
                value={[threshold]}
                onValueChange={(v) => setThreshold(v[0])}
                min={0}
                max={1}
                step={0.01}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-700">{cm.tp}</div>
                <div className="text-xs text-green-600 mt-1">真正例(TP)</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-700">{cm.fp}</div>
                <div className="text-xs text-red-600 mt-1">假正例(FP)</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-700">{cm.fn}</div>
                <div className="text-xs text-orange-600 mt-1">假反例(FN)</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700">{cm.tn}</div>
                <div className="text-xs text-blue-600 mt-1">真反例(TN)</div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <div className="flex justify-between">
                <span>灵敏度(Recall):</span>
                <span className="font-medium">{((cm.tp / (cm.tp + cm.fn)) * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>特异度(Specificity):</span>
                <span className="font-medium">{((cm.tn / (cm.tn + cm.fp)) * 100).toFixed(2)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">评估指标说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">AUC</Badge>
              <span className="text-gray-600">ROC曲线下面积，衡量模型整体区分能力，值越接近1越好</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">K-S</Badge>
              <span className="text-gray-600">Kolmogorov-Smirnov统计量，衡量正负样本分布差异，值越大越好</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">精确率</Badge>
              <span className="text-gray-600">预测为正例中真正为正例的比例</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">召回率</Badge>
              <span className="text-gray-600">真正为正例中被正确预测的比例</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">F1-Score</Badge>
              <span className="text-gray-600">精确率和召回率的调和平均数，综合评价指标</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="roc" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="roc">ROC曲线</TabsTrigger>
          <TabsTrigger value="ks">K-S曲线</TabsTrigger>
          <TabsTrigger value="pr">P-R曲线</TabsTrigger>
          <TabsTrigger value="accuracy">准确率曲线</TabsTrigger>
          <TabsTrigger value="lift">提升度</TabsTrigger>
          <TabsTrigger value="gain">增益曲线</TabsTrigger>
        </TabsList>

        <TabsContent value="roc">
          <Card>
            <CardContent className="pt-4">
              <div ref={rocRef} className="h-80" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ks">
          <Card>
            <CardContent className="pt-4">
              <div ref={ksRef} className="h-80" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pr">
          <Card>
            <CardContent className="pt-4">
              <div ref={prRef} className="h-80" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy">
          <Card>
            <CardContent className="pt-4">
              <div ref={accuracyRef} className="h-80" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lift">
          <Card>
            <CardContent className="pt-4">
              <div ref={liftRef} className="h-80" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gain">
          <Card>
            <CardContent className="pt-4">
              <div ref={gainRef} className="h-80" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}