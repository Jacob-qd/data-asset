import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// 工作台
import DataOverview from "./pages/DataOverview";
import Cockpit from "./pages/Cockpit";
import ProjectManagementPortal from "./pages/ProjectManagementPortal";
import AssetRegistration from "./pages/AssetRegistration";
import RuleConfiguration from "./pages/RuleConfiguration";
import NotificationCenter from "./pages/NotificationCenter";

// 数据资源
import ResourceCatalog from "./pages/ResourceCatalog";
import LineageGraph from "./pages/LineageGraph";
import DataProducts from "./pages/DataProducts";
import AssetAccounts from "./pages/AssetAccounts";

// 应用场景中心
import SceneList from "./pages/SceneList";
import SceneCreateWizard from "./pages/SceneCreateWizard";

// 数据沙箱
import SandboxProjectList from "./pages/SandboxProjectList";
import MyDevResources from "./pages/MyDevResources";
import SandboxProductVerify from "./pages/SandboxProductVerify";
import SandboxDataPreview from "./pages/SandboxDataPreview";
import SandboxPreprocess from "./pages/SandboxPreprocess";
import SandboxModelTrain from "./pages/SandboxModelTrain";
import SandboxAudit from "./pages/SandboxAudit";
import SandboxResultReview from "./pages/SandboxResultReview";

// 隐私计算
import PrivacyTaskCenter from "./pages/PrivacyTaskCenter";
import VisualModelingIDE from "./pages/VisualModelingIDE";
import ModelManagement from "./pages/ModelManagement";
import ModelEvaluation from "./pages/ModelEvaluation";
import TaskExecutionDetail from "./pages/TaskExecutionDetail";
import PrivacyNodeManagement from "./pages/PrivacyNodeManagement";

// 密态计算
import MpcEngine from "./pages/secret/MpcEngine";
import TeeEnv from "./pages/secret/TeeEnv";
import HeEngine from "./pages/secret/HeEngine";
import SecretNetwork from "./pages/secret/SecretNetwork";
import SecretKeys from "./pages/SecretKeys";
import SecretResourcePool from "./pages/SecretResourcePool";

// 区块链
import BlockchainAuditLogs from "./pages/BlockchainAuditLogs";
import CrossChainManagement from "./pages/CrossChainManagement";
import ContractLifecycle from "./pages/ContractLifecycle";
import GovernanceChain from "./pages/GovernanceChain";
import BlockchainSystem from "./pages/BlockchainSystem";
import BlockchainOps from "./pages/BlockchainOps";

// 抽样管理
import SamplingTasks from "./pages/SamplingTasks";
import SamplingStandardLib from "./pages/SamplingStandardLib";
import QualityInspection from "./pages/QualityInspection";
import SampleManagement from "./pages/SampleManagement";
import DataSourceManage from "./pages/DataSourceManage";

// 数据产品
import DataProductPortal from "./pages/DataProductPortal";
import DataCart from "./pages/DataCart";

// 审批中心
import ResourceApproval from "./pages/ResourceApproval";
import CodeApproval from "./pages/CodeApproval";
import ReportApproval from "./pages/ReportApproval";
import CooperationApproval from "./pages/CooperationApproval";

// 服务与监控
import ServiceReports from "./pages/ServiceReports";
import TaskMonitoring from "./pages/TaskMonitoring";
import AuditCenter from "./pages/AuditCenter";
import AlertManagement from "./pages/AlertManagement";

// 平台管理
import InstitutionManagement from "./pages/InstitutionManagement";
import RolePermission from "./pages/RolePermission";
import APIKeyManagement from "./pages/APIKeyManagement";
import OperationLog from "./pages/OperationLog";

// 统计报表
import ReportCenter from "./pages/ReportCenter";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 工作台 */}
        <Route path="/" element={<Layout><DataOverview /></Layout>} />
        <Route path="/cockpit" element={<Layout><Cockpit /></Layout>} />
        <Route path="/workbench/projects" element={<Layout><ProjectManagementPortal /></Layout>} />
        <Route path="/workbench/registration" element={<Layout><AssetRegistration /></Layout>} />
        <Route path="/workbench/rules" element={<Layout><RuleConfiguration /></Layout>} />
        <Route path="/workbench/notifications" element={<Layout><NotificationCenter /></Layout>} />

        {/* 数据资源 */}
        <Route path="/resources" element={<Layout><ResourceCatalog /></Layout>} />
        <Route path="/lineage" element={<Layout><LineageGraph /></Layout>} />
        <Route path="/products" element={<Layout><DataProducts /></Layout>} />
        <Route path="/accounts" element={<Layout><AssetAccounts /></Layout>} />

        {/* 应用场景中心 */}
        <Route path="/scenes" element={<Layout><SceneList /></Layout>} />
        <Route path="/scenes/create" element={<Layout><SceneCreateWizard /></Layout>} />

        {/* 数据沙箱 */}
        <Route path="/sandbox/projects" element={<Layout><SandboxProjectList /></Layout>} />
        <Route path="/sandbox/resources" element={<Layout><MyDevResources /></Layout>} />
        <Route path="/sandbox/verify" element={<Layout><SandboxProductVerify /></Layout>} />
        <Route path="/sandbox/preview" element={<Layout><SandboxDataPreview /></Layout>} />
        <Route path="/sandbox/preprocess" element={<Layout><SandboxPreprocess /></Layout>} />
        <Route path="/sandbox/train" element={<Layout><SandboxModelTrain /></Layout>} />
        <Route path="/sandbox/audit" element={<Layout><SandboxAudit /></Layout>} />
        <Route path="/sandbox/review" element={<Layout><SandboxResultReview /></Layout>} />

        {/* 隐私计算 */}
        <Route path="/privacy/tasks" element={<Layout><PrivacyTaskCenter /></Layout>} />
        <Route path="/privacy/tasks/:type" element={<Layout><PrivacyTaskCenter /></Layout>} />
        <Route path="/privacy/tasks/modeling/visual" element={<Layout><VisualModelingIDE /></Layout>} />
        <Route path="/privacy/models" element={<Layout><ModelManagement /></Layout>} />
        <Route path="/privacy/models/evaluation/:modelId" element={<Layout><ModelEvaluation /></Layout>} />
        <Route path="/privacy/tasks/execution/:taskId" element={<Layout><TaskExecutionDetail /></Layout>} />
        <Route path="/privacy/nodes" element={<Layout><PrivacyNodeManagement /></Layout>} />

        {/* 密态计算 */}
        <Route path="/secret/mpc-engine" element={<Layout><MpcEngine /></Layout>} />
        <Route path="/secret/tee" element={<Layout><TeeEnv /></Layout>} />
        <Route path="/secret/he-engine" element={<Layout><HeEngine /></Layout>} />
        <Route path="/secret/network" element={<Layout><SecretNetwork /></Layout>} />
        <Route path="/secret/keys" element={<Layout><SecretKeys /></Layout>} />
        <Route path="/secret/resources" element={<Layout><SecretResourcePool /></Layout>} />

        {/* 区块链 */}
        <Route path="/blockchain/audit-logs" element={<Layout><BlockchainAuditLogs /></Layout>} />
        <Route path="/blockchain/cross-chain-mgmt" element={<Layout><CrossChainManagement /></Layout>} />
        <Route path="/contract-lifecycle" element={<Layout><ContractLifecycle /></Layout>} />
        <Route path="/blockchain/governance" element={<Layout><GovernanceChain /></Layout>} />
        <Route path="/blockchain/system" element={<Layout><BlockchainSystem /></Layout>} />
        <Route path="/blockchain/ops" element={<Layout><BlockchainOps /></Layout>} />

        {/* 抽样管理 */}
        <Route path="/sampling/tasks" element={<Layout><SamplingTasks /></Layout>} />
        <Route path="/sampling/standards" element={<Layout><SamplingStandardLib /></Layout>} />
        <Route path="/sampling/inspection" element={<Layout><QualityInspection /></Layout>} />
        <Route path="/sampling/samples" element={<Layout><SampleManagement /></Layout>} />
        <Route path="/sampling/datasources" element={<Layout><DataSourceManage /></Layout>} />

        {/* 数据产品 */}
        <Route path="/product-portal" element={<Layout><DataProductPortal /></Layout>} />
        <Route path="/data-cart" element={<Layout><DataCart /></Layout>} />

        {/* 审批中心 */}
        <Route path="/privacy/approval/resources" element={<Layout><ResourceApproval /></Layout>} />
        <Route path="/privacy/approval/code" element={<Layout><CodeApproval /></Layout>} />
        <Route path="/privacy/approval/reports" element={<Layout><ReportApproval /></Layout>} />
        <Route path="/privacy/approval/cooperation" element={<Layout><CooperationApproval /></Layout>} />

        {/* 服务与监控 */}
        <Route path="/privacy/service-reports" element={<Layout><ServiceReports /></Layout>} />
        <Route path="/privacy/task-monitor" element={<Layout><TaskMonitoring /></Layout>} />
        <Route path="/audit" element={<Layout><AuditCenter /></Layout>} />
        <Route path="/privacy/alerts" element={<Layout><AlertManagement /></Layout>} />

        {/* 平台管理 */}
        <Route path="/platform/institutions" element={<Layout><InstitutionManagement /></Layout>} />
        <Route path="/platform/roles" element={<Layout><RolePermission /></Layout>} />
        <Route path="/privacy/api-keys" element={<Layout><APIKeyManagement /></Layout>} />
        <Route path="/platform/operation-log" element={<Layout><OperationLog /></Layout>} />

        {/* 统计报表 */}
        <Route path="/reports" element={<Layout><ReportCenter /></Layout>} />
      </Routes>
    </HashRouter>
  );
}