import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import DataOverview from "./pages/DataOverview";
import Cockpit from "./pages/Cockpit";
import Portal from "./pages/Portal";
import ResourceCatalog from "./pages/ResourceCatalog";
import LineageGraph from "./pages/LineageGraph";
import DataProducts from "./pages/DataProducts";
import AssetAccounts from "./pages/AssetAccounts";
import SamplingRules from "./pages/SamplingRules";
import SamplingTasks from "./pages/SamplingTasks";
import SamplingAudit from "./pages/SamplingAudit";
import DataSourceManage from "./pages/DataSourceManage";
import ReportCenter from "./pages/ReportCenter";
import DataSandbox from "./pages/DataSandbox";
import SandboxComponents from "./pages/SandboxComponents";
import SandboxMasking from "./pages/SandboxMasking";
import PrivacyComputing from "./pages/PrivacyComputing";
import PrivacyMonitor from "./pages/PrivacyMonitor";
import PrivacyAuditLog from "./pages/PrivacyAuditLog";
import PrivacyParties from "./pages/PrivacyParties";
import PrivacyModels from "./pages/PrivacyModels";
import PrivacyResources from "./pages/PrivacyResources";
import PrivacyAPI from "./pages/PrivacyAPI";
import PrivacyServices from "./pages/PrivacyServices";
import SecretProjects from "./pages/SecretProjects";
import SecretTasks from "./pages/SecretTasks";
import SecretParties from "./pages/SecretParties";
import BlockchainOverview from "./pages/BlockchainOverview";
import BlockchainNotary from "./pages/BlockchainNotary";
import BlockchainTrace from "./pages/BlockchainTrace";
import BlockchainNodes from "./pages/BlockchainNodes";
import BlockchainContracts from "./pages/BlockchainContracts";
import BlockchainExplorer from "./pages/BlockchainExplorer";
import BlockchainCore from "./pages/BlockchainCore";
import BlockchainSubchains from "./pages/BlockchainSubchains";
import BlockchainSystem from "./pages/BlockchainSystem";
import BlockchainOps from "./pages/BlockchainOps";
import BlockchainHostManage from "./pages/BlockchainHostManage";
import BlockchainNetwork from "./pages/BlockchainNetwork";
import BlockchainChannels from "./pages/BlockchainChannels";
import BlockchainGateway from "./pages/BlockchainGateway";
import ContractVersions from "./pages/ContractVersions";
import ContractDeploy from "./pages/ContractDeploy";
import ContractTesting from "./pages/ContractTesting";
import CrossChainRouter from "./pages/CrossChainRouter";
import CrossChainExplorer from "./pages/CrossChainExplorer";
import GovernanceChain from "./pages/GovernanceChain";
import BlockchainMonitoring from "./pages/BlockchainMonitoring";
import ContractMarket from "./pages/ContractMarket";
import ModelingProjects from "./pages/ModelingProjects";
import SetOperations from "./pages/SetOperations";
import JointStatistics from "./pages/JointStatistics";
import FederatedLearning from "./pages/FederatedLearning";
import ScorecardComputing from "./pages/ScorecardComputing";
import MPCICoder from "./pages/MPCICoder";
import CustomQuery from "./pages/CustomQuery";
import JointSQL from "./pages/JointSQL";
import TaskCenter from "./pages/TaskCenter";
import AlgorithmManagement from "./pages/AlgorithmManagement";
import ResourceApproval from "./pages/ResourceApproval";
import CodeApproval from "./pages/CodeApproval";
import ReportApproval from "./pages/ReportApproval";
import CooperationApproval from "./pages/CooperationApproval";
import NodeManagement from "./pages/NodeManagement";
import ResourceMonitoring from "./pages/ResourceMonitoring";
import AlertManagement from "./pages/AlertManagement";
import TaskMonitoring from "./pages/TaskMonitoring";
import PlatformAuditLog from "./pages/PlatformAuditLog";
import AuditCenter from "./pages/AuditCenter";
import ContractLifecycle from "./pages/ContractLifecycle";
import Workbench from "./pages/Workbench";
import ProjectManagementPortal from "./pages/ProjectManagementPortal";
import AssetRegistration from "./pages/AssetRegistration";
import RuleConfiguration from "./pages/RuleConfiguration";
import SceneConfiguration from "./pages/SceneConfiguration";
import EnterpriseAccounts from "./pages/EnterpriseAccounts";
import IndustryAccounts from "./pages/IndustryAccounts";
import ServiceMonitoring from "./pages/ServiceMonitoring";
import ServiceAuditCenter from "./pages/ServiceAuditCenter";
import ConditionalSetOps from "./pages/ConditionalSetOps";
import DataProcessing from "./pages/DataProcessing";
import AlgorithmPackageApproval from "./pages/AlgorithmPackageApproval";
import AlgorithmCodeApproval from "./pages/AlgorithmCodeApproval";
import ModelDownloadApproval from "./pages/ModelDownloadApproval";
import CustomCodeApproval from "./pages/CustomCodeApproval";
import JointSQLApproval from "./pages/JointSQLApproval";
import CertificateManagement from "./pages/CertificateManagement";
import ServiceReports from "./pages/ServiceReports";
import CallLogs from "./pages/CallLogs";
import DataStatistics from "./pages/DataStatistics";
import ProjectMonitor from "./pages/ProjectMonitor";
import UsageMonitor from "./pages/UsageMonitor";
import SecretPSI from "./pages/SecretPSI";
import SecretPIR from "./pages/SecretPIR";
import SecretMonitor from "./pages/SecretMonitor";
import SecretResourcePool from "./pages/SecretResourcePool";
import SecretJointStats from "./pages/SecretJointStats";
import SecretKeys from "./pages/SecretKeys";
import SecretAuditLog from "./pages/SecretAuditLog";
import SecretDataGovernance from "./pages/SecretDataGovernance";
import SecretServices from "./pages/SecretServices";
import MpcEngine from "./pages/secret/MpcEngine";
import TeeEnv from "./pages/secret/TeeEnv";
import HeEngine from "./pages/secret/HeEngine";
import SecretNetwork from "./pages/secret/SecretNetwork";
import BusinessFlow from "./pages/BusinessFlow";
import CrossChain from "./pages/CrossChain";
import ContractEvents from "./pages/ContractEvents";
import DevComponents from "./pages/DevComponents";
import ModelSliceDownload from "./pages/ModelSliceDownload";
import NotebookProcessing from "./pages/NotebookProcessing";
import InterconnectionHub from "./pages/InterconnectionHub";
import ModelPrediction from "./pages/ModelPrediction";
import PublishService from "./pages/PublishService";
import ModelVersion from "./pages/ModelVersion";
import FederatedEvaluation from "./pages/FederatedEvaluation";
import PSIStatisticsTask from "./pages/PSIStatisticsTask";
import PSILabeledTask from "./pages/PSILabeledTask";
import AlgorithmPackageCompute from "./pages/AlgorithmPackageCompute";
import FederatedPrediction from "./pages/FederatedPrediction";
import TaskAudit from "./pages/TaskAudit";
import SystemAudit from "./pages/SystemAudit";
import OperationLog from "./pages/OperationLog";
import DataQualityReport from "./pages/DataQualityReport";
import InstitutionManagement from "./pages/InstitutionManagement";
import RolePermission from "./pages/RolePermission";
import APIKeyManagement from "./pages/APIKeyManagement";
import NotificationCenter from "./pages/NotificationCenter";
import DataLabelManagement from "./pages/DataLabelManagement";
import ResourceAuthRecords from "./pages/ResourceAuthRecords";
import DataMaskingRules from "./pages/DataMaskingRules";
import ResourceUsageDetail from "./pages/ResourceUsageDetail";
import SandboxProjectList from "./pages/SandboxProjectList";
import SandboxDataPreview from "./pages/SandboxDataPreview";
import SandboxDebugEnv from "./pages/SandboxDebugEnv";
import SandboxRunEnv from "./pages/SandboxRunEnv";
import SandboxPreprocess from "./pages/SandboxPreprocess";
import SandboxDataAlign from "./pages/SandboxDataAlign";
import SandboxModelTrain from "./pages/SandboxModelTrain";
import SandboxCompareMode from "./pages/SandboxCompareMode";
import SandboxAudit from "./pages/SandboxAudit";
import SandboxResultReview from "./pages/SandboxResultReview";
import SamplingStandardLib from "./pages/SamplingStandardLib";
import QualityInspection from "./pages/QualityInspection";
import QualityReport from "./pages/QualityReport";
import SampleManagement from "./pages/SampleManagement";
import ProblemStatistics from "./pages/ProblemStatistics";

const wrap = (Component: React.FC) => (
  <Layout><Component /></Layout>
);

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout><DataOverview /></Layout>} />
        <Route path="/cockpit" element={<Layout><Cockpit /></Layout>} />
        <Route path="/portal" element={<Layout><Portal /></Layout>} />
        <Route path="/resources" element={<Layout><ResourceCatalog /></Layout>} />
        <Route path="/lineage" element={<Layout><LineageGraph /></Layout>} />
        <Route path="/products" element={<Layout><DataProducts /></Layout>} />
        <Route path="/accounts" element={<Layout><AssetAccounts /></Layout>} />
        <Route path="/sampling/rules" element={<Layout><SamplingRules /></Layout>} />
        <Route path="/sampling/tasks" element={<Layout><SamplingTasks /></Layout>} />
        <Route path="/sampling/audit" element={<Layout><SamplingAudit /></Layout>} />
        <Route path="/sampling/datasources" element={<Layout><DataSourceManage /></Layout>} />
        <Route path="/reports" element={<Layout><ReportCenter /></Layout>} />
        <Route path="/sandbox" element={<Layout><DataSandbox /></Layout>} />
        <Route path="/sandbox/components" element={<Layout><SandboxComponents /></Layout>} />
        <Route path="/sandbox/masking" element={<Layout><SandboxMasking /></Layout>} />
        <Route path="/sandbox/projects" element={<Layout><SandboxProjectList /></Layout>} />
        <Route path="/sandbox/preview" element={<Layout><SandboxDataPreview /></Layout>} />
        <Route path="/sandbox/debug" element={<Layout><SandboxDebugEnv /></Layout>} />
        <Route path="/sandbox/run" element={<Layout><SandboxRunEnv /></Layout>} />
        <Route path="/sandbox/preprocess" element={<Layout><SandboxPreprocess /></Layout>} />
        <Route path="/sandbox/align" element={<Layout><SandboxDataAlign /></Layout>} />
        <Route path="/sandbox/train" element={<Layout><SandboxModelTrain /></Layout>} />
        <Route path="/sandbox/compare" element={<Layout><SandboxCompareMode /></Layout>} />
        <Route path="/sandbox/audit" element={<Layout><SandboxAudit /></Layout>} />
        <Route path="/sandbox/review" element={<Layout><SandboxResultReview /></Layout>} />
        <Route path="/sampling/standards" element={<Layout><SamplingStandardLib /></Layout>} />
        <Route path="/sampling/inspection" element={<Layout><QualityInspection /></Layout>} />
        <Route path="/sampling/reports" element={<Layout><QualityReport /></Layout>} />
        <Route path="/sampling/samples" element={<Layout><SampleManagement /></Layout>} />
        <Route path="/sampling/problems" element={<Layout><ProblemStatistics /></Layout>} />
        <Route path="/sandbox/ide" element={<Layout><DataSandbox /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyComputing /></Layout>} />
        <Route path="/privacy/monitor" element={<Layout><PrivacyMonitor /></Layout>} />
        <Route path="/privacy/audit" element={<Layout><PrivacyAuditLog /></Layout>} />
        <Route path="/audit" element={<Layout><AuditCenter /></Layout>} />
        <Route path="/contract-lifecycle" element={<Layout><ContractLifecycle /></Layout>} />
        <Route path="/privacy/parties" element={<Layout><PrivacyParties /></Layout>} />
        <Route path="/privacy/models" element={<Layout><PrivacyModels /></Layout>} />
        <Route path="/privacy/resources" element={<Layout><PrivacyResources /></Layout>} />
        <Route path="/privacy/api" element={<Layout><PrivacyAPI /></Layout>} />
        <Route path="/privacy/services" element={<Layout><PrivacyServices /></Layout>} />
        <Route path="/secret/projects" element={<Layout><SecretProjects /></Layout>} />
        <Route path="/secret/tasks" element={<Layout><SecretTasks /></Layout>} />
        <Route path="/secret/parties" element={<Layout><SecretParties /></Layout>} />
        <Route path="/blockchain" element={<Layout><BlockchainOverview /></Layout>} />
        <Route path="/blockchain/nodes" element={<Layout><BlockchainNodes /></Layout>} />
        <Route path="/blockchain/explorer" element={<Layout><BlockchainExplorer /></Layout>} />
        <Route path="/blockchain/core" element={<Layout><BlockchainCore /></Layout>} />
        <Route path="/blockchain/contracts" element={<Layout><BlockchainContracts /></Layout>} />
        <Route path="/blockchain/subchains" element={<Layout><BlockchainSubchains /></Layout>} />
        <Route path="/blockchain/system" element={<Layout><BlockchainSystem /></Layout>} />
        <Route path="/blockchain/ops" element={<Layout><BlockchainOps /></Layout>} />
        <Route path="/privacy/projects" element={<Layout><ModelingProjects /></Layout>} />
        <Route path="/privacy/set-operations" element={<Layout><SetOperations /></Layout>} />
        <Route path="/privacy/joint-stats" element={<Layout><JointStatistics /></Layout>} />
        <Route path="/privacy/federated" element={<Layout><FederatedLearning /></Layout>} />
        <Route path="/privacy/scorecard" element={<Layout><ScorecardComputing /></Layout>} />
        <Route path="/privacy/mpc-coder" element={<Layout><MPCICoder /></Layout>} />
        <Route path="/privacy/custom-query" element={<Layout><CustomQuery /></Layout>} />
        <Route path="/privacy/joint-sql" element={<Layout><JointSQL /></Layout>} />
        <Route path="/privacy/task-center" element={<Layout><TaskCenter /></Layout>} />
        <Route path="/privacy/algorithms" element={<Layout><AlgorithmManagement /></Layout>} />
        <Route path="/privacy/approval/resources" element={<Layout><ResourceApproval /></Layout>} />
        <Route path="/privacy/approval/code" element={<Layout><CodeApproval /></Layout>} />
        <Route path="/privacy/approval/reports" element={<Layout><ReportApproval /></Layout>} />
        <Route path="/privacy/approval/cooperation" element={<Layout><CooperationApproval /></Layout>} />
        <Route path="/privacy/nodes" element={<Layout><NodeManagement /></Layout>} />
        <Route path="/privacy/resource-monitor" element={<Layout><ResourceMonitoring /></Layout>} />
        <Route path="/privacy/alerts" element={<Layout><AlertManagement /></Layout>} />
        <Route path="/privacy/task-monitor" element={<Layout><TaskMonitoring /></Layout>} />
        <Route path="/platform/audit" element={<Layout><PlatformAuditLog /></Layout>} />
        <Route path="/workbench" element={<Layout><Workbench /></Layout>} />
        <Route path="/workbench/projects" element={<Layout><ProjectManagementPortal /></Layout>} />
        <Route path="/workbench/registration" element={<Layout><AssetRegistration /></Layout>} />
        <Route path="/workbench/rules" element={<Layout><RuleConfiguration /></Layout>} />
        <Route path="/workbench/scenes" element={<Layout><SceneConfiguration /></Layout>} />
        <Route path="/accounts/enterprise" element={<Layout><EnterpriseAccounts /></Layout>} />
        <Route path="/accounts/industry" element={<Layout><IndustryAccounts /></Layout>} />
        <Route path="/privacy/service-monitor" element={<Layout><ServiceMonitoring /></Layout>} />
        <Route path="/privacy/service-monitor" element={<Layout><ServiceMonitoring /></Layout>} />
        <Route path="/privacy/service-audit" element={<Layout><ServiceAuditCenter /></Layout>} />
        <Route path="/privacy/conditional-set-ops" element={<Layout><ConditionalSetOps /></Layout>} />
        <Route path="/privacy/data-processing" element={<Layout><DataProcessing /></Layout>} />
        <Route path="/privacy/approval/algorithm-packages" element={<Layout><AlgorithmPackageApproval /></Layout>} />
        <Route path="/privacy/approval/algorithm-code" element={<Layout><AlgorithmCodeApproval /></Layout>} />
        <Route path="/privacy/approval/model-download" element={<Layout><ModelDownloadApproval /></Layout>} />
        <Route path="/privacy/approval/custom-code" element={<Layout><CustomCodeApproval /></Layout>} />
        <Route path="/privacy/approval/joint-sql" element={<Layout><JointSQLApproval /></Layout>} />
        <Route path="/privacy/certificates" element={<Layout><CertificateManagement /></Layout>} />
        <Route path="/privacy/service-reports" element={<Layout><ServiceReports /></Layout>} />
        <Route path="/privacy/call-logs" element={<Layout><CallLogs /></Layout>} />
        <Route path="/privacy/data-stats" element={<Layout><DataStatistics /></Layout>} />
        <Route path="/privacy/project-monitor" element={<Layout><ProjectMonitor /></Layout>} />
        <Route path="/privacy/usage-monitor" element={<Layout><UsageMonitor /></Layout>} />
        <Route path="/secret/psi" element={<Layout><SecretPSI /></Layout>} />
        <Route path="/secret/pir" element={<Layout><SecretPIR /></Layout>} />
        <Route path="/secret/monitor" element={<Layout><SecretMonitor /></Layout>} />
        <Route path="/secret/resource-pool" element={<Layout><SecretResourcePool /></Layout>} />
        <Route path="/secret/joint-stats" element={<Layout><SecretJointStats /></Layout>} />
        <Route path="/secret/federated" element={<Layout><FederatedLearning /></Layout>} />
        <Route path="/secret/keys" element={<Layout><SecretKeys /></Layout>} />
        <Route path="/secret/audit" element={<Layout><SecretAuditLog /></Layout>} />
        <Route path="/secret/resources" element={<Layout><SecretResourcePool /></Layout>} />
        <Route path="/secret/data-governance" element={<Layout><SecretDataGovernance /></Layout>} />
        <Route path="/secret/services" element={<Layout><SecretServices /></Layout>} />
        <Route path="/secret/mpc-engine" element={<Layout><MpcEngine /></Layout>} />
        <Route path="/secret/tee" element={<Layout><TeeEnv /></Layout>} />
        <Route path="/secret/he-engine" element={<Layout><HeEngine /></Layout>} />
        <Route path="/secret/network" element={<Layout><SecretNetwork /></Layout>} />
        <Route path="/business-flow" element={<Layout><BusinessFlow /></Layout>} />
        <Route path="/blockchain/cross-chain" element={<Layout><CrossChain /></Layout>} />
        <Route path="/blockchain/contract-events" element={<Layout><ContractEvents /></Layout>} />
        <Route path="/blockchain/dev-components" element={<Layout><DevComponents /></Layout>} />
        <Route path="/blockchain/hosts" element={<Layout><BlockchainHostManage /></Layout>} />
        <Route path="/blockchain/networks" element={<Layout><BlockchainNetwork /></Layout>} />
        <Route path="/blockchain/channels" element={<Layout><BlockchainChannels /></Layout>} />
        <Route path="/blockchain/gateway" element={<Layout><BlockchainGateway /></Layout>} />
        <Route path="/blockchain/contract-versions" element={<Layout><ContractVersions /></Layout>} />
        <Route path="/blockchain/contract-deploy" element={<Layout><ContractDeploy /></Layout>} />
        <Route path="/blockchain/contract-testing" element={<Layout><ContractTesting /></Layout>} />
        <Route path="/blockchain/cross-chain-router" element={<Layout><CrossChainRouter /></Layout>} />
        <Route path="/blockchain/cross-chain-explorer" element={<Layout><CrossChainExplorer /></Layout>} />
        <Route path="/blockchain/governance" element={<Layout><GovernanceChain /></Layout>} />
        <Route path="/blockchain/monitoring" element={<Layout><BlockchainMonitoring /></Layout>} />
        <Route path="/blockchain/contract-market" element={<Layout><ContractMarket /></Layout>} />
        <Route path="/privacy/model-slice-download" element={<Layout><ModelSliceDownload /></Layout>} />
        <Route path="/privacy/notebook-processing" element={<Layout><NotebookProcessing /></Layout>} />
        <Route path="/interconnection" element={<Layout><InterconnectionHub /></Layout>} />
        <Route path="/privacy/model-prediction" element={<Layout><ModelPrediction /></Layout>} />
        <Route path="/privacy/publish-service" element={<Layout><PublishService /></Layout>} />
        <Route path="/privacy/model-version" element={<Layout><ModelVersion /></Layout>} />
        <Route path="/privacy/federated-evaluation" element={<Layout><FederatedEvaluation /></Layout>} />
        <Route path="/privacy/psi-statistics" element={<Layout><PSIStatisticsTask /></Layout>} />
        <Route path="/privacy/psi-labeled" element={<Layout><PSILabeledTask /></Layout>} />
        <Route path="/privacy/algorithm-package-compute" element={<Layout><AlgorithmPackageCompute /></Layout>} />
        <Route path="/privacy/federated-prediction" element={<Layout><FederatedPrediction /></Layout>} />
        <Route path="/privacy/task-audit" element={<Layout><TaskAudit /></Layout>} />
        <Route path="/privacy/system-audit" element={<Layout><SystemAudit /></Layout>} />
        <Route path="/platform/operation-log" element={<Layout><OperationLog /></Layout>} />
        <Route path="/privacy/data-quality" element={<Layout><DataQualityReport /></Layout>} />
        <Route path="/platform/institutions" element={<Layout><InstitutionManagement /></Layout>} />
        <Route path="/platform/roles" element={<Layout><RolePermission /></Layout>} />
        <Route path="/privacy/api-keys" element={<Layout><APIKeyManagement /></Layout>} />
        <Route path="/workbench/notifications" element={<Layout><NotificationCenter /></Layout>} />
        <Route path="/privacy/data-labels" element={<Layout><DataLabelManagement /></Layout>} />
        <Route path="/privacy/auth-records" element={<Layout><ResourceAuthRecords /></Layout>} />
        <Route path="/sandbox/masking-rules" element={<Layout><DataMaskingRules /></Layout>} />
        <Route path="/privacy/resource-usage" element={<Layout><ResourceUsageDetail /></Layout>} />
      </Routes>
    </HashRouter>
  );
}
