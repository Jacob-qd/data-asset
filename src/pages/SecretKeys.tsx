import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Key, Shield, Plus, Search, Download, Upload, RefreshCw, Lock,
  Unlock, Clock, CheckCircle2, AlertTriangle, Eye, Pencil, Trash2,
  Ban, FileX, History, Wand2, Import, Users, RotateCcw, Archive,
  ChevronRight, ChevronLeft, FileUp, Check,
} from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CryptoKey {
  id: string;
  name: string;
  type: string;
  algorithm: string;
  owner: string;
  status: "active" | "expiring" | "revoked" | "disabled" | "deprecated";
  created: string;
  expires: string;
  description?: string;
  fingerprint?: string;
  purpose?: string;
}

interface Certificate {
  id: string;
  subject: string;
  issuer: string;
  serial: string;
  keyUsage: string;
  validFrom: string;
  validTo: string;
  status: "valid" | "expiring" | "revoked";
  description?: string;
}

interface CrlEntry {
  id: string;
  certId: string;
  subject: string;
  reason: string;
  revokedAt: string;
  revokedBy: string;
}

interface KeyLifecycle {
  id: string;
  keyId: string;
  event: string;
  fromStatus?: string;
  toStatus: string;
  timestamp: string;
  operator: string;
}

interface KeyVersion {
  id: string;
  keyId: string;
  version: number;
  created: string;
  status: "active" | "deprecated" | "revoked";
  fingerprint: string;
}

interface KeyPermission {
  id: string;
  keyId: string;
  user: string;
  role: string;
  level: "read" | "write" | "admin";
  project?: string;
}

interface RotationPolicy {
  id: string;
  name: string;
  keyId: string;
  period: string;
  nextRotation: string;
  autoRotate: boolean;
}

interface BackupRecord {
  id: string;
  keyId: string;
  keyName: string;
  backedUpAt: string;
  backedUpBy: string;
  type: "single" | "batch";
}

const genId = () => Date.now().toString(36).toUpperCase();

const genFingerprint = () => {
  const hex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return hex.match(/.{1,4}/g)?.join(":") || hex;
};

const initialKeys: CryptoKey[] = [
  { id: "KEY-001", name: "项目A-加密密钥", type: "AES-256", algorithm: "AES-GCM", owner: "参与方A", status: "active", created: "2024-01-15", expires: "2025-01-15", description: "项目A数据加密密钥", fingerprint: "a1b2:c3d4:e5f6:a7b8:c9d0:e1f2:a3b4:c5d6:e7f8:a9b0:c1d2:e3f4:a5b6:c7d8:e9f0:a1b2", purpose: "数据加密" },
  { id: "KEY-002", name: "项目B-签名密钥", type: "RSA-2048", algorithm: "RSA-PSS", owner: "参与方B", status: "active", created: "2024-02-20", expires: "2025-02-20", description: "项目B数字签名密钥", fingerprint: "b2c3:d4e5:f6a7:b8c9:d0e1:f2a3:b4c5:d6e7:f8a9:b0c1:d2e3:f4a5:b6c7:d8e9:f0a1:b2c3", purpose: "数字签名" },
  { id: "KEY-003", name: "联邦学习-梯度密钥", type: "ECDH", algorithm: "ECDH-P256", owner: "协调方", status: "active", created: "2024-03-10", expires: "2024-09-10", description: "联邦学习梯度加密密钥", fingerprint: "c3d4:e5f6:a7b8:c9d0:e1f2:a3b4:c5d6:e7f8:a9b0:c1d2:e3f4:a5b6:c7d8:e9f0:a1b2:c3d4", purpose: "密钥协商" },
  { id: "KEY-004", name: "PSI-求交密钥", type: "AES-256", algorithm: "AES-GCM", owner: "参与方C", status: "expiring", created: "2023-10-01", expires: "2024-04-30", description: "PSI求交协议密钥", fingerprint: "d4e5:f6a7:b8c9:d0e1:f2a3:b4c5:d6e7:f8a9:b0c1:d2e3:f4a5:b6c7:d8e9:f0a1:b2c3:d4e5", purpose: "数据加密" },
  { id: "KEY-005", name: "项目A-旧密钥", type: "AES-128", algorithm: "AES-CBC", owner: "参与方A", status: "revoked", created: "2023-06-01", expires: "已吊销", description: "已废弃的旧密钥", fingerprint: "e5f6:a7b8:c9d0:e1f2:a3b4:c5d6:e7f8:a9b0:c1d2:e3f4:a5b6:c7d8:e9f0:a1b2:c3d4:e5f6", purpose: "数据加密" },
  { id: "KEY-006", name: "项目C-协商密钥", type: "ECDSA", algorithm: "ECDSA-P256", owner: "参与方D", status: "active", created: "2024-04-01", expires: "2025-04-01", description: "项目C密钥协商", fingerprint: "f6a7:b8c9:d0e1:f2a3:b4c5:d6e7:f8a9:b0c1:d2e3:f4a5:b6c7:d8e9:f0a1:b2c3:d4e5:f6a7", purpose: "密钥协商" },
  { id: "KEY-007", name: "TEE-密封密钥", type: "AES-256", algorithm: "AES-GCM", owner: "TEE节点1", status: "active", created: "2024-04-05", expires: "2025-04-05", description: "TEE环境密封密钥", fingerprint: "a7b8:c9d0:e1f2:a3b4:c5d6:e7f8:a9b0:c1d2:e3f4:a5b6:c7d8:e9f0:a1b2:c3d4:e5f6:a7b8", purpose: "数据加密" },
  { id: "KEY-008", name: "项目D-加密密钥", type: "RSA-4096", algorithm: "RSA-OAEP", owner: "参与方E", status: "disabled", created: "2023-12-01", expires: "已禁用", description: "已禁用的项目D密钥", fingerprint: "b8c9:d0e1:f2a3:b4c5:d6e7:f8a9:b0c1:d2e3:f4a5:b6c7:d8e9:f0a1:b2c3:d4e5:f6a7:b8c9", purpose: "数据加密" },
  { id: "KEY-009", name: "MPC-乘法三元组", type: "AES-256", algorithm: "AES-GCM", owner: "协调方", status: "active", created: "2024-04-10", expires: "2025-04-10", description: "MPC三元组生成密钥", fingerprint: "c9d0:e1f2:a3b4:c5d6:e7f8:a9b0:c1d2:e3f4:a5b6:c7d8:e9f0:a1b2:c3d4:e5f6:a7b8:c9d0", purpose: "数据加密" },
  { id: "KEY-010", name: "ZKP-证明密钥", type: "ECDSA", algorithm: "ECDSA-P256", owner: "参与方F", status: "expiring", created: "2023-08-01", expires: "2024-05-15", description: "零知识证明签名密钥", fingerprint: "d0e1:f2a3:b4c5:d6e7:f8a9:b0c1:d2e3:f4a5:b6c7:d8e9:f0a1:b2c3:d4e5:f6a7:b8c9:d0e1", purpose: "数字签名" },
];

const initialCerts: Certificate[] = [
  { id: "CERT-001", subject: "参与方A", issuer: "密态计算CA", serial: "A1:B2:C3:D4", keyUsage: "数字签名,密钥协商", validFrom: "2024-01-01", validTo: "2025-01-01", status: "valid", description: "参与方A身份证书" },
  { id: "CERT-002", subject: "参与方B", issuer: "密态计算CA", serial: "B2:C3:D4:E5", keyUsage: "数字签名,数据加密", validFrom: "2024-02-01", validTo: "2025-02-01", status: "valid", description: "参与方B身份证书" },
  { id: "CERT-003", subject: "协调方", issuer: "密态计算CA", serial: "C3:D4:E5:F6", keyUsage: "数字签名,证书签发", validFrom: "2023-04-01", validTo: "2024-05-01", status: "expiring", description: "协调方身份证书" },
  { id: "CERT-004", subject: "参与方C", issuer: "密态计算CA", serial: "D4:E5:F6:G7", keyUsage: "数字签名", validFrom: "2023-01-01", validTo: "2024-01-01", status: "revoked", description: "已吊销证书" },
  { id: "CERT-005", subject: "参与方D", issuer: "密态计算CA", serial: "E5:F6:G7:H8", keyUsage: "数字签名,密钥协商", validFrom: "2024-03-01", validTo: "2025-03-01", status: "valid", description: "参与方D身份证书" },
  { id: "CERT-006", subject: "TEE节点1", issuer: "密态计算CA", serial: "F6:G7:H8:I9", keyUsage: "数字签名,数据加密", validFrom: "2024-04-01", validTo: "2025-04-01", status: "valid", description: "TEE节点身份证书" },
  { id: "CERT-007", subject: "参与方E", issuer: "密态计算CA", serial: "G7:H8:I9:J0", keyUsage: "数字签名", validFrom: "2023-06-01", validTo: "2024-06-01", status: "expiring", description: "参与方E身份证书" },
  { id: "CERT-008", subject: "审计方", issuer: "密态计算CA", serial: "H8:I9:J0:K1", keyUsage: "数字签名,证书签发", validFrom: "2024-01-15", validTo: "2025-01-15", status: "valid", description: "审计方身份证书" },
];

const initialCrl: CrlEntry[] = [
  { id: "CRL-001", certId: "CERT-004", subject: "参与方C", reason: "密钥泄露", revokedAt: "2024-01-15", revokedBy: "管理员A" },
  { id: "CRL-002", certId: "CERT-005", subject: "测试节点", reason: "测试结束", revokedAt: "2024-02-01", revokedBy: "管理员B" },
  { id: "CRL-003", certId: "CERT-009", subject: "临时节点", reason: "临时授权过期", revokedAt: "2024-03-10", revokedBy: "管理员A" },
  { id: "CRL-004", certId: "CERT-010", subject: "外包方", reason: "合同终止", revokedAt: "2024-03-20", revokedBy: "管理员C" },
  { id: "CRL-005", certId: "CERT-011", subject: "离职员工", reason: "人员离职", revokedAt: "2024-04-01", revokedBy: "管理员B" },
];

const initialLifecycle: KeyLifecycle[] = [
  { id: "LIF-001", keyId: "KEY-001", event: "创建", toStatus: "active", timestamp: "2024-01-15 10:00", operator: "管理员A" },
  { id: "LIF-002", keyId: "KEY-005", event: "吊销", fromStatus: "active", toStatus: "revoked", timestamp: "2024-01-10 14:00", operator: "管理员B" },
  { id: "LIF-003", keyId: "KEY-004", event: "延期", fromStatus: "expiring", toStatus: "active", timestamp: "2024-04-20 09:00", operator: "管理员A" },
  { id: "LIF-004", keyId: "KEY-008", event: "禁用", fromStatus: "active", toStatus: "disabled", timestamp: "2024-03-01 16:00", operator: "管理员C" },
  { id: "LIF-005", keyId: "KEY-006", event: "创建", toStatus: "active", timestamp: "2024-04-01 11:00", operator: "管理员A" },
  { id: "LIF-006", keyId: "KEY-007", event: "创建", toStatus: "active", timestamp: "2024-04-05 09:30", operator: "管理员B" },
  { id: "LIF-007", keyId: "KEY-009", event: "创建", toStatus: "active", timestamp: "2024-04-10 14:00", operator: "管理员A" },
  { id: "LIF-008", keyId: "KEY-010", event: "到期预警", fromStatus: "active", toStatus: "expiring", timestamp: "2024-04-15 08:00", operator: "系统" },
];

const initialVersions: KeyVersion[] = [
  { id: "VER-001", keyId: "KEY-001", version: 1, created: "2023-06-15", status: "deprecated", fingerprint: "a1b2:c3d4:e5f6:a7b8:c9d0:e1f2:a3b4:c5d6:e7f8:a9b0:c1d2:e3f4:a5b6:c7d8:e9f0:a1b2" },
  { id: "VER-002", keyId: "KEY-001", version: 2, created: "2024-01-15", status: "active", fingerprint: "b2c3:d4e5:f6a7:b8c9:d0e1:f2a3:b4c5:d6e7:f8a9:b0c1:d2e3:f4a5:b6c7:d8e9:f0a1:b2c3" },
  { id: "VER-003", keyId: "KEY-002", version: 1, created: "2024-02-20", status: "active", fingerprint: "c3d4:e5f6:a7b8:c9d0:e1f2:a3b4:c5d6:e7f8:a9b0:c1d2:e3f4:a5b6:c7d8:e9f0:a1b2:c3d4" },
  { id: "VER-004", keyId: "KEY-005", version: 1, created: "2023-06-01", status: "revoked", fingerprint: "d4e5:f6a7:b8c9:d0e1:f2a3:b4c5:d6e7:f8a9:b0c1:d2e3:f4a5:b6c7:d8e9:f0a1:b2c3:d4e5" },
];

const initialPermissions: KeyPermission[] = [
  { id: "PER-001", keyId: "KEY-001", user: "用户A", role: "数据科学家", level: "read", project: "项目A" },
  { id: "PER-002", keyId: "KEY-001", user: "用户B", role: "管理员", level: "admin", project: "项目A" },
  { id: "PER-003", keyId: "KEY-002", user: "用户C", role: "工程师", level: "write", project: "项目B" },
  { id: "PER-004", keyId: "KEY-003", user: "用户D", role: "协调员", level: "admin", project: "联邦学习" },
];

const initialPolicies: RotationPolicy[] = [
  { id: "POL-001", name: "项目A-轮换策略", keyId: "KEY-001", period: "90天", nextRotation: "2024-07-15", autoRotate: true },
  { id: "POL-002", name: "项目B-轮换策略", keyId: "KEY-002", period: "180天", nextRotation: "2024-08-20", autoRotate: false },
  { id: "POL-003", name: "联邦学习-轮换策略", keyId: "KEY-003", period: "60天", nextRotation: "2024-06-10", autoRotate: true },
  { id: "POL-004", name: "TEE-轮换策略", keyId: "KEY-007", period: "365天", nextRotation: "2025-04-05", autoRotate: true },
];

const initialBackups: BackupRecord[] = [
  { id: "BAK-001", keyId: "KEY-001", keyName: "项目A-加密密钥", backedUpAt: "2024-03-15 10:00", backedUpBy: "管理员A", type: "single" },
  { id: "BAK-002", keyId: "KEY-002", keyName: "项目B-签名密钥", backedUpAt: "2024-03-15 10:05", backedUpBy: "管理员A", type: "batch" },
  { id: "BAK-003", keyId: "KEY-003", keyName: "联邦学习-梯度密钥", backedUpAt: "2024-03-15 10:05", backedUpBy: "管理员A", type: "batch" },
];

const keyFields: FieldConfig[] = [
  { key: "name", label: "密钥名称", type: "text", required: true },
  { key: "type", label: "密钥类型", type: "select", required: true, options: [
    { label: "AES-256", value: "AES-256" },
    { label: "AES-128", value: "AES-128" },
    { label: "RSA-2048", value: "RSA-2048" },
    { label: "RSA-4096", value: "RSA-4096" },
    { label: "ECDH", value: "ECDH" },
    { label: "ECDSA", value: "ECDSA" },
  ]},
  { key: "algorithm", label: "算法", type: "select", required: true, options: [
    { label: "AES-GCM", value: "AES-GCM" },
    { label: "AES-CBC", value: "AES-CBC" },
    { label: "RSA-PSS", value: "RSA-PSS" },
    { label: "RSA-OAEP", value: "RSA-OAEP" },
    { label: "ECDH-P256", value: "ECDH-P256" },
    { label: "ECDSA-P256", value: "ECDSA-P256" },
  ]},
  { key: "owner", label: "持有者", type: "text", required: true },
  { key: "expires", label: "过期时间", type: "text", required: true, placeholder: "YYYY-MM-DD" },
  { key: "description", label: "描述", type: "textarea" },
];

const certFields: FieldConfig[] = [
  { key: "subject", label: "主题", type: "text", required: true },
  { key: "issuer", label: "签发者", type: "text", required: true },
  { key: "serial", label: "序列号", type: "text", required: true },
  { key: "keyUsage", label: "密钥用途", type: "text", required: true },
  { key: "validFrom", label: "生效时间", type: "text", required: true, placeholder: "YYYY-MM-DD" },
  { key: "validTo", label: "过期时间", type: "text", required: true, placeholder: "YYYY-MM-DD" },
  { key: "description", label: "描述", type: "textarea" },
];

const algorithms = [
  { label: "AES-256-GCM", value: "AES-256-GCM", type: "AES-256" },
  { label: "RSA-2048", value: "RSA-2048", type: "RSA-2048" },
  { label: "RSA-4096", value: "RSA-4096", type: "RSA-4096" },
  { label: "ECDH-P256", value: "ECDH-P256", type: "ECDH" },
  { label: "ECDSA-P256", value: "ECDSA-P256", type: "ECDSA" },
  { label: "SM2", value: "SM2", type: "SM2" },
  { label: "SM4", value: "SM4", type: "SM4" },
];

export default function SecretKeys() {
  const [keys, setKeys] = useState<CryptoKey[]>(initialKeys);
  const [certificates, setCertificates] = useState<Certificate[]>(initialCerts);
  const [crl, setCrl] = useState<CrlEntry[]>(initialCrl);
  const [lifecycle, setLifecycle] = useState<KeyLifecycle[]>(initialLifecycle);
  const [versions, setVersions] = useState<KeyVersion[]>(initialVersions);
  const [permissions, setPermissions] = useState<KeyPermission[]>(initialPermissions);
  const [policies, setPolicies] = useState<RotationPolicy[]>(initialPolicies);
  const [backups, setBackups] = useState<BackupRecord[]>(initialBackups);

  const [searchQuery, setSearchQuery] = useState("");
  const [certSearch, setCertSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogType, setDialogType] = useState<"key" | "cert">("key");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<any>(null);
  const [drawerType, setDrawerType] = useState<"key" | "cert" | "crl" | "lifecycle">("key");

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardAlgo, setWizardAlgo] = useState("");
  const [wizardPurpose, setWizardPurpose] = useState("");
  const [wizardExpiry, setWizardExpiry] = useState("");
  const [wizardOwner, setWizardOwner] = useState("");
  const [wizardName, setWizardName] = useState("");

  // Import state
  const [importOpen, setImportOpen] = useState(false);
  const [importContent, setImportContent] = useState("");
  const [importAlias, setImportAlias] = useState("");
  const [importPurpose, setImportPurpose] = useState("");
  const [importPassword, setImportPassword] = useState("");
  const [importAlgo, setImportAlgo] = useState("");

  // Permission state
  const [permOpen, setPermOpen] = useState(false);
  const [permKeyId, setPermKeyId] = useState("");
  const [permUser, setPermUser] = useState("");
  const [permRole, setPermRole] = useState("");
  const [permLevel, setPermLevel] = useState<"read" | "write" | "admin">("read");

  // Backup state
  const [backupOpen, setBackupOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  // Policy state
  const [policyTab, setPolicyTab] = useState("policies");

  const filteredKeys = keys.filter((k) => k.name.includes(searchQuery) || k.id.includes(searchQuery));
  const filteredCerts = certificates.filter((c) => c.subject.includes(certSearch) || c.id.includes(certSearch));

  const openDialog = (type: typeof dialogType, mode: typeof dialogMode, item?: any) => {
    setDialogType(type);
    setDialogMode(mode);
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const openDrawer = (type: typeof drawerType, item: any) => {
    setDrawerType(type);
    setDrawerItem(item);
    setDrawerOpen(true);
  };

  const handleKeySubmit = (data: any) => {
    if (dialogMode === "create") {
      const newKey: CryptoKey = {
        id: `KEY-${String(keys.length + 1).padStart(3, "0")}`,
        ...data,
        status: "active",
        created: new Date().toISOString().split("T")[0],
      };
      setKeys([...keys, newKey]);
      setLifecycle([...lifecycle, {
        id: `LIF-${String(lifecycle.length + 1).padStart(3, "0")}`,
        keyId: newKey.id,
        event: "创建",
        toStatus: "active",
        timestamp: new Date().toLocaleString("zh-CN"),
        operator: "当前用户",
      }]);
    } else if (dialogMode === "edit" && selectedItem) {
      setKeys(keys.map(k => k.id === selectedItem.id ? { ...k, ...data } : k));
    }
  };

  const handleCertSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newCert: Certificate = {
        id: `CERT-${String(certificates.length + 1).padStart(3, "0")}`,
        ...data,
        status: "valid",
      };
      setCertificates([...certificates, newCert]);
    } else if (dialogMode === "edit" && selectedItem) {
      setCertificates(certificates.map(c => c.id === selectedItem.id ? { ...c, ...data } : c));
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    if (dialogType === "key") {
      setKeys(keys.filter(k => k.id !== selectedItem.id));
    } else if (dialogType === "cert") {
      setCertificates(certificates.filter(c => c.id !== selectedItem.id));
    }
    setDialogOpen(false);
  };

  const revokeKey = (id: string) => {
    setKeys(keys.map(k => {
      if (k.id !== id) return k;
      return { ...k, status: "revoked" as const, expires: "已吊销" };
    }));
    setLifecycle([...lifecycle, {
      id: `LIF-${String(lifecycle.length + 1).padStart(3, "0")}`,
      keyId: id,
      event: "吊销",
      fromStatus: "active",
      toStatus: "revoked",
      timestamp: new Date().toLocaleString("zh-CN"),
      operator: "当前用户",
    }]);
  };

  const disableKey = (id: string) => {
    setKeys(keys.map(k => {
      if (k.id !== id) return k;
      return { ...k, status: "disabled" as const };
    }));
  };

  const toggleKeySelection = (id: string) => {
    const next = new Set(selectedKeys);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedKeys(next);
  };

  const getDialogFields = () => {
    return dialogType === "key" ? keyFields : certFields;
  };

  const getDialogTitle = () => {
    return dialogType === "key" ? "密钥" : "证书";
  };

  const getDrawerFields = () => {
    switch (drawerType) {
      case "key":
        return [
          { key: "id", label: "密钥ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "type", label: "类型", type: "badge" as const },
          { key: "algorithm", label: "算法", type: "badge" as const },
          { key: "owner", label: "持有者", type: "text" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "created", label: "创建时间", type: "date" as const },
          { key: "expires", label: "过期时间", type: "date" as const },
          { key: "fingerprint", label: "指纹", type: "text" as const },
          { key: "purpose", label: "用途", type: "badge" as const },
          { key: "description", label: "描述", type: "text" as const },
        ];
      case "cert":
        return [
          { key: "id", label: "证书ID", type: "text" as const },
          { key: "subject", label: "主题", type: "text" as const },
          { key: "issuer", label: "签发者", type: "text" as const },
          { key: "serial", label: "序列号", type: "text" as const },
          { key: "keyUsage", label: "密钥用途", type: "text" as const },
          { key: "validFrom", label: "生效时间", type: "date" as const },
          { key: "validTo", label: "过期时间", type: "date" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "description", label: "描述", type: "text" as const },
        ];
      case "crl":
        return [
          { key: "id", label: "吊销ID", type: "text" as const },
          { key: "certId", label: "证书ID", type: "badge" as const },
          { key: "subject", label: "主题", type: "text" as const },
          { key: "reason", label: "原因", type: "badge" as const },
          { key: "revokedAt", label: "吊销时间", type: "date" as const },
          { key: "revokedBy", label: "操作人", type: "text" as const },
        ];
      case "lifecycle":
        return [
          { key: "id", label: "记录ID", type: "text" as const },
          { key: "keyId", label: "密钥ID", type: "badge" as const },
          { key: "event", label: "事件", type: "badge" as const },
          { key: "fromStatus", label: "原状态", type: "badge" as const },
          { key: "toStatus", label: "新状态", type: "badge" as const },
          { key: "timestamp", label: "时间", type: "date" as const },
          { key: "operator", label: "操作人", type: "text" as const },
        ];
    }
  };

  // Wizard functions
  const openWizard = () => {
    setWizardOpen(true);
    setWizardStep(1);
    setWizardAlgo("");
    setWizardPurpose("");
    setWizardExpiry("");
    setWizardOwner("");
    setWizardName("");
  };

  const closeWizard = () => {
    setWizardOpen(false);
  };

  const submitWizard = () => {
    const algo = algorithms.find(a => a.value === wizardAlgo);
    const newKey: CryptoKey = {
      id: `KEY-${String(keys.length + 1).padStart(3, "0")}`,
      name: wizardName || `${algo?.label || wizardAlgo}-密钥`,
      type: algo?.type || "Unknown",
      algorithm: wizardAlgo,
      owner: wizardOwner || "当前用户",
      status: "active",
      created: new Date().toISOString().split("T")[0],
      expires: wizardExpiry || "2025-12-31",
      description: `通过密钥生成向导创建的${algo?.label || wizardAlgo}密钥`,
      fingerprint: genFingerprint(),
      purpose: wizardPurpose || "通用",
    };
    setKeys([...keys, newKey]);
    setVersions([...versions, {
      id: genId(),
      keyId: newKey.id,
      version: 1,
      created: newKey.created,
      status: "active",
      fingerprint: newKey.fingerprint || genFingerprint(),
    }]);
    setLifecycle([...lifecycle, {
      id: `LIF-${String(lifecycle.length + 1).padStart(3, "0")}`,
      keyId: newKey.id,
      event: "创建",
      toStatus: "active",
      timestamp: new Date().toLocaleString("zh-CN"),
      operator: "当前用户",
    }]);
    setPolicies([...policies, {
      id: genId(),
      name: `${newKey.name}-轮换策略`,
      keyId: newKey.id,
      period: "90天",
      nextRotation: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      autoRotate: true,
    }]);
    closeWizard();
  };

  // Import functions
  const openImport = () => {
    setImportOpen(true);
    setImportContent("");
    setImportAlias("");
    setImportPurpose("");
    setImportPassword("");
    setImportAlgo("");
  };

  const detectAlgo = (content: string) => {
    if (content.includes("AES")) return "AES-256-GCM";
    if (content.includes("RSA PRIVATE")) return "RSA-2048";
    if (content.includes("RSA PUBLIC")) return "RSA-2048";
    if (content.includes("EC PRIVATE")) return "ECDSA-P256";
    if (content.includes("ECDSA")) return "ECDSA-P256";
    if (content.includes("SM2")) return "SM2";
    if (content.includes("SM4")) return "SM4";
    return "AES-256-GCM";
  };

  const handleImportContentChange = (content: string) => {
    setImportContent(content);
    if (!importAlgo && content) {
      setImportAlgo(detectAlgo(content));
    }
  };

  const submitImport = () => {
    const algo = importAlgo || detectAlgo(importContent);
    const algoInfo = algorithms.find(a => a.value === algo);
    const newKey: CryptoKey = {
      id: `KEY-${String(keys.length + 1).padStart(3, "0")}`,
      name: importAlias || `导入-${algo}-密钥`,
      type: algoInfo?.type || "Unknown",
      algorithm: algo,
      owner: "当前用户",
      status: "active",
      created: new Date().toISOString().split("T")[0],
      expires: "2025-12-31",
      description: `从PEM/DER导入的${algo}密钥`,
      fingerprint: genFingerprint(),
      purpose: importPurpose || "导入密钥",
    };
    setKeys([...keys, newKey]);
    setVersions([...versions, {
      id: genId(),
      keyId: newKey.id,
      version: 1,
      created: newKey.created,
      status: "active",
      fingerprint: newKey.fingerprint || genFingerprint(),
    }]);
    setLifecycle([...lifecycle, {
      id: `LIF-${String(lifecycle.length + 1).padStart(3, "0")}`,
      keyId: newKey.id,
      event: "导入",
      toStatus: "active",
      timestamp: new Date().toLocaleString("zh-CN"),
      operator: "当前用户",
    }]);
    setImportOpen(false);
  };

  // Backup functions
  const backupKey = (key: CryptoKey) => {
    const record: BackupRecord = {
      id: genId(),
      keyId: key.id,
      keyName: key.name,
      backedUpAt: new Date().toLocaleString("zh-CN"),
      backedUpBy: "当前用户",
      type: "single",
    };
    setBackups([...backups, record]);
    setBackupOpen(true);
  };

  const batchBackup = () => {
    const now = new Date().toLocaleString("zh-CN");
    const newBackups: BackupRecord[] = [];
    selectedKeys.forEach(id => {
      const key = keys.find(k => k.id === id);
      if (key) {
        newBackups.push({
          id: genId(),
          keyId: key.id,
          keyName: key.name,
          backedUpAt: now,
          backedUpBy: "当前用户",
          type: "batch",
        });
      }
    });
    setBackups([...backups, ...newBackups]);
    setSelectedKeys(new Set());
    setBackupOpen(true);
  };

  // Permission functions
  const openPermissions = (keyId: string) => {
    setPermKeyId(keyId);
    setPermOpen(true);
    setPermUser("");
    setPermRole("");
    setPermLevel("read");
  };

  const addPermission = () => {
    if (!permUser || !permRole) return;
    const newPerm: KeyPermission = {
      id: genId(),
      keyId: permKeyId,
      user: permUser,
      role: permRole,
      level: permLevel,
    };
    setPermissions([...permissions, newPerm]);
    setPermUser("");
    setPermRole("");
    setPermLevel("read");
  };

  const removePermission = (id: string) => {
    setPermissions(permissions.filter(p => p.id !== id));
  };

  // Rotation functions
  const rotateKey = (keyId: string) => {
    const key = keys.find(k => k.id === keyId);
    if (!key) return;

    const keyVersions = versions.filter(v => v.keyId === keyId);
    const nextVersion = keyVersions.length > 0 ? Math.max(...keyVersions.map(v => v.version)) + 1 : 1;

    // Mark old versions as deprecated
    setVersions(versions.map(v => v.keyId === keyId && v.status === "active" ? { ...v, status: "deprecated" as const } : v));

    // Create new version
    const newFp = genFingerprint();
    setVersions([...versions, {
      id: genId(),
      keyId,
      version: nextVersion,
      created: new Date().toISOString().split("T")[0],
      status: "active",
      fingerprint: newFp,
    }]);

    // Update key
    setKeys(keys.map(k => k.id === keyId ? { ...k, fingerprint: newFp } : k));

    // Update lifecycle
    setLifecycle([...lifecycle, {
      id: `LIF-${String(lifecycle.length + 1).padStart(3, "0")}`,
      keyId,
      event: "轮换",
      fromStatus: "active",
      toStatus: "active",
      timestamp: new Date().toLocaleString("zh-CN"),
      operator: "当前用户",
    }]);

    // Update policy
    setPolicies(policies.map(p => p.keyId === keyId ? { ...p, nextRotation: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0] } : p));
  };

  const toggleAutoRotate = (policyId: string) => {
    setPolicies(policies.map(p => p.id === policyId ? { ...p, autoRotate: !p.autoRotate } : p));
  };

  const activeCount = keys.filter(k => k.status === "active").length;
  const expiringCount = keys.filter(k => k.status === "expiring").length;
  const revokedCount = keys.filter(k => k.status === "revoked").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">密钥与证书</h1>
          <p className="text-sm text-gray-500 mt-1">密钥生命周期、证书管理、吊销列表</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={openImport}>
            <Import className="w-4 h-4" />导入密钥
          </Button>
          <Button variant="outline" className="gap-2" onClick={openWizard}>
            <Wand2 className="w-4 h-4" />生成密钥
          </Button>
          <Button className="gap-2" onClick={() => openDialog("key", "create")}>
            <Plus className="w-4 h-4" />新建密钥
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Key className="w-5 h-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold text-gray-900">{keys.length}</div><div className="text-xs text-gray-500">密钥总数</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
          <div><div className="text-2xl font-bold text-gray-900">{activeCount}</div><div className="text-xs text-gray-500">有效密钥</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Shield className="w-5 h-5 text-purple-600" /></div>
          <div><div className="text-2xl font-bold text-gray-900">{certificates.length}</div><div className="text-xs text-gray-500">证书总数</div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
          <div><div className="text-2xl font-bold text-gray-900">{expiringCount}</div><div className="text-xs text-gray-500">即将过期</div></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys" className="gap-2"><Key className="w-4 h-4" />密钥管理</TabsTrigger>
          <TabsTrigger value="certs" className="gap-2"><Shield className="w-4 h-4" />证书管理</TabsTrigger>
          <TabsTrigger value="crl" className="gap-2"><Ban className="w-4 h-4" />吊销列表</TabsTrigger>
          <TabsTrigger value="lifecycle" className="gap-2"><History className="w-4 h-4" />生命周期</TabsTrigger>
          <TabsTrigger value="rotation" className="gap-2"><RotateCcw className="w-4 h-4" />轮换策略</TabsTrigger>
          <TabsTrigger value="backups" className="gap-2"><Archive className="w-4 h-4" />备份记录</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索密钥..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {selectedKeys.size > 0 && (
              <Button variant="outline" className="gap-2" onClick={batchBackup}>
                <Archive className="w-4 h-4" />批量备份 ({selectedKeys.size})
              </Button>
            )}
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">密钥列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>密钥ID</TableHead><TableHead>名称</TableHead><TableHead>类型</TableHead>
                    <TableHead>算法</TableHead><TableHead>持有者</TableHead><TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead><TableHead>过期时间</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedKeys.has(key.id)}
                          onChange={() => toggleKeySelection(key.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{key.id}</TableCell>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>{key.type}</TableCell>
                      <TableCell className="text-xs">{key.algorithm}</TableCell>
                      <TableCell>{key.owner}</TableCell>
                      <TableCell>
                        {key.status === "active" && <Badge className="bg-green-50 text-green-700 border-green-200 gap-1"><Lock className="w-3 h-3" />有效</Badge>}
                        {key.status === "expiring" && <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><Clock className="w-3 h-3" />即将过期</Badge>}
                        {key.status === "revoked" && <Badge className="bg-red-50 text-red-700 border-red-200 gap-1"><Unlock className="w-3 h-3" />已吊销</Badge>}
                        {key.status === "disabled" && <Badge className="bg-gray-50 text-gray-700 border-gray-200">已禁用</Badge>}
                        {key.status === "deprecated" && <Badge className="bg-gray-50 text-gray-700 border-gray-200">已废弃</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{key.created}</TableCell>
                      <TableCell className="text-xs text-gray-500">{key.expires}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("key", key)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("key", "edit", key)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => backupKey(key)}><Download className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPermissions(key.id)}><Users className="w-4 h-4" /></Button>
                          {key.status === "active" && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => disableKey(key.id)}><Ban className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => revokeKey(key.id)}><FileX className="w-4 h-4" /></Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDialog("key", "delete", key)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索证书..." className="pl-9" value={certSearch} onChange={(e) => setCertSearch(e.target.value)} />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => openDialog("cert", "create")}><Plus className="w-4 h-4" />申请证书</Button>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">证书列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>证书ID</TableHead><TableHead>主题</TableHead><TableHead>签发者</TableHead>
                    <TableHead>序列号</TableHead><TableHead>密钥用途</TableHead><TableHead>有效期</TableHead>
                    <TableHead>状态</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCerts.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-xs">{cert.id}</TableCell>
                      <TableCell className="font-medium">{cert.subject}</TableCell>
                      <TableCell>{cert.issuer}</TableCell>
                      <TableCell className="font-mono text-xs">{cert.serial}</TableCell>
                      <TableCell className="text-xs">{cert.keyUsage}</TableCell>
                      <TableCell className="text-xs text-gray-500">{cert.validFrom} ~ {cert.validTo}</TableCell>
                      <TableCell>
                        {cert.status === "valid" && <Badge className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle2 className="w-3 h-3" />有效</Badge>}
                        {cert.status === "expiring" && <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><Clock className="w-3 h-3" />即将过期</Badge>}
                        {cert.status === "revoked" && <Badge className="bg-red-50 text-red-700 border-red-200 gap-1"><AlertTriangle className="w-3 h-3" />已吊销</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("cert", cert)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("cert", "edit", cert)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(cert.serial); }}><Download className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDialog("cert", "delete", cert)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crl" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">证书吊销列表 (CRL)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>吊销ID</TableHead><TableHead>证书ID</TableHead><TableHead>主题</TableHead>
                    <TableHead>吊销原因</TableHead><TableHead>吊销时间</TableHead><TableHead>操作人</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crl.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-xs">{entry.id}</TableCell>
                      <TableCell><Badge variant="outline">{entry.certId}</Badge></TableCell>
                      <TableCell className="font-medium">{entry.subject}</TableCell>
                      <TableCell><Badge variant="outline">{entry.reason}</Badge></TableCell>
                      <TableCell className="text-xs text-gray-500">{entry.revokedAt}</TableCell>
                      <TableCell>{entry.revokedBy}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("crl", entry)}><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">密钥生命周期记录</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>记录ID</TableHead><TableHead>密钥ID</TableHead><TableHead>事件</TableHead>
                    <TableHead>原状态</TableHead><TableHead>新状态</TableHead><TableHead>时间</TableHead><TableHead>操作人</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lifecycle.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id}</TableCell>
                      <TableCell><Badge variant="outline">{item.keyId}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{item.event}</Badge></TableCell>
                      <TableCell>{item.fromStatus ? <Badge variant="outline">{item.fromStatus}</Badge> : "-"}</TableCell>
                      <TableCell><Badge>{item.toStatus}</Badge></TableCell>
                      <TableCell className="text-xs text-gray-500">{item.timestamp}</TableCell>
                      <TableCell>{item.operator}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("lifecycle", item)}><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rotation" className="space-y-4">
          <Tabs value={policyTab} onValueChange={setPolicyTab}>
            <TabsList>
              <TabsTrigger value="policies">轮换策略</TabsTrigger>
              <TabsTrigger value="versions">版本历史</TabsTrigger>
            </TabsList>
            <TabsContent value="policies" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">轮换策略列表</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>策略名称</TableHead><TableHead>密钥</TableHead><TableHead>轮换周期</TableHead>
                        <TableHead>下次轮换</TableHead><TableHead>自动轮换</TableHead><TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policies.map((policy) => (
                        <TableRow key={policy.id}>
                          <TableCell className="font-medium">{policy.name}</TableCell>
                          <TableCell><Badge variant="outline">{policy.keyId}</Badge></TableCell>
                          <TableCell>{policy.period}</TableCell>
                          <TableCell className="text-xs text-gray-500">{policy.nextRotation}</TableCell>
                          <TableCell>
                            <Switch checked={policy.autoRotate} onCheckedChange={() => toggleAutoRotate(policy.id)} />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => rotateKey(policy.keyId)}>
                              <RotateCcw className="w-3 h-3" />手动轮换
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="versions" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">密钥版本历史</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>版本ID</TableHead><TableHead>密钥ID</TableHead><TableHead>版本号</TableHead>
                        <TableHead>创建时间</TableHead><TableHead>状态</TableHead><TableHead>指纹</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versions.map((ver) => (
                        <TableRow key={ver.id}>
                          <TableCell className="font-mono text-xs">{ver.id}</TableCell>
                          <TableCell><Badge variant="outline">{ver.keyId}</Badge></TableCell>
                          <TableCell>v{ver.version}</TableCell>
                          <TableCell className="text-xs text-gray-500">{ver.created}</TableCell>
                          <TableCell>
                            {ver.status === "active" && <Badge className="bg-green-50 text-green-700 border-green-200">当前</Badge>}
                            {ver.status === "deprecated" && <Badge className="bg-gray-50 text-gray-700 border-gray-200">已废弃</Badge>}
                            {ver.status === "revoked" && <Badge className="bg-red-50 text-red-700 border-red-200">已吊销</Badge>}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{ver.fingerprint}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">备份记录</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>备份ID</TableHead><TableHead>密钥ID</TableHead><TableHead>密钥名称</TableHead>
                    <TableHead>备份类型</TableHead><TableHead>备份时间</TableHead><TableHead>备份人</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-mono text-xs">{backup.id}</TableCell>
                      <TableCell><Badge variant="outline">{backup.keyId}</Badge></TableCell>
                      <TableCell className="font-medium">{backup.keyName}</TableCell>
                      <TableCell>
                        {backup.type === "single" ? <Badge variant="secondary">单独</Badge> : <Badge variant="secondary">批量</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{backup.backedUpAt}</TableCell>
                      <TableCell>{backup.backedUpBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CrudDialog
        open={dialogOpen && dialogMode !== "delete"}
        onOpenChange={setDialogOpen}
        title={getDialogTitle()}
        fields={getDialogFields()}
        data={selectedItem}
        onSubmit={(data) => {
          if (dialogType === "key") handleKeySubmit(data);
          else handleCertSubmit(data);
        }}
        mode={dialogMode}
      />

      {dialogMode === "delete" && dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />确认删除
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                确定要删除 <strong>{selectedItem?.name || selectedItem?.id}</strong> 吗？此操作不可撤销。
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button variant="destructive" onClick={handleDelete}>确认删除</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Key Generation Wizard */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>生成密钥 - 步骤 {wizardStep}/3</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === wizardStep ? "bg-blue-600 text-white" :
                    step < wizardStep ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {step < wizardStep ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 3 && <div className={`w-8 h-0.5 ${step < wizardStep ? "bg-green-600" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>

            {wizardStep === 1 && (
              <div className="space-y-4">
                <Label>选择算法</Label>
                <div className="grid grid-cols-2 gap-2">
                  {algorithms.map((algo) => (
                    <div
                      key={algo.value}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        wizardAlgo === algo.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setWizardAlgo(algo.value)}
                    >
                      <div className="font-medium text-sm">{algo.label}</div>
                      <div className="text-xs text-gray-500">{algo.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>密钥名称</Label>
                  <Input value={wizardName} onChange={(e) => setWizardName(e.target.value)} placeholder="输入密钥名称" />
                </div>
                <div className="space-y-2">
                  <Label>用途</Label>
                  <Input value={wizardPurpose} onChange={(e) => setWizardPurpose(e.target.value)} placeholder="如: 数据加密、数字签名" />
                </div>
                <div className="space-y-2">
                  <Label>过期时间</Label>
                  <Input type="date" value={wizardExpiry} onChange={(e) => setWizardExpiry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>持有者</Label>
                  <Input value={wizardOwner} onChange={(e) => setWizardOwner(e.target.value)} placeholder="输入持有者名称" />
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">配置摘要</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">算法</div>
                    <div>{wizardAlgo}</div>
                    <div className="text-gray-500">名称</div>
                    <div>{wizardName || `${wizardAlgo}-密钥`}</div>
                    <div className="text-gray-500">用途</div>
                    <div>{wizardPurpose || "通用"}</div>
                    <div className="text-gray-500">过期时间</div>
                    <div>{wizardExpiry || "2025-12-31"}</div>
                    <div className="text-gray-500">持有者</div>
                    <div>{wizardOwner || "当前用户"}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  点击"生成"将创建新密钥并添加到密钥列表中。
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            {wizardStep > 1 && (
              <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" />上一步
              </Button>
            )}
            {wizardStep < 3 ? (
              <Button onClick={() => setWizardStep(wizardStep + 1)} disabled={wizardStep === 1 && !wizardAlgo}>
                下一步<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={submitWizard}>
                <Wand2 className="w-4 h-4 mr-1" />生成
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>导入密钥</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>密钥内容 (PEM/DER)</Label>
              <Textarea
                value={importContent}
                onChange={(e) => handleImportContentChange(e.target.value)}
                placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                className="min-h-[120px] font-mono text-xs"
              />
            </div>
            {importAlgo && (
              <div className="text-sm text-blue-600">
                检测到算法: <strong>{importAlgo}</strong>
              </div>
            )}
            <div className="space-y-2">
              <Label>别名</Label>
              <Input value={importAlias} onChange={(e) => setImportAlias(e.target.value)} placeholder="输入密钥别名" />
            </div>
            <div className="space-y-2">
              <Label>用途</Label>
              <Input value={importPurpose} onChange={(e) => setImportPurpose(e.target.value)} placeholder="如: 数据加密" />
            </div>
            <div className="space-y-2">
              <Label>密码 (如加密)</Label>
              <Input type="password" value={importPassword} onChange={(e) => setImportPassword(e.target.value)} placeholder="可选" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>取消</Button>
            <Button onClick={submitImport} disabled={!importContent}>
              <Import className="w-4 h-4 mr-1" />导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog open={backupOpen} onOpenChange={setBackupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />备份成功
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              密钥备份已创建。备份文件已导出为JSON格式。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackupOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>恢复密钥</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">点击或拖拽上传备份文件</p>
              <p className="text-xs text-gray-400 mt-1">支持 JSON 格式</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreOpen(false)}>取消</Button>
            <Button onClick={() => setRestoreOpen(false)}>
              <Upload className="w-4 h-4 mr-1" />恢复
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Dialog */}
      <Dialog open={permOpen} onOpenChange={setPermOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>密钥权限配置</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium">密钥ID: <Badge variant="outline">{permKeyId}</Badge></div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">当前权限</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">用户</TableHead>
                    <TableHead className="text-xs">角色</TableHead>
                    <TableHead className="text-xs">级别</TableHead>
                    <TableHead className="text-xs">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.filter(p => p.keyId === permKeyId).map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell className="text-sm">{perm.user}</TableCell>
                      <TableCell className="text-sm">{perm.role}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          perm.level === "admin" ? "text-red-600" :
                          perm.level === "write" ? "text-amber-600" : "text-blue-600"
                        }>
                          {perm.level === "admin" ? "管理" : perm.level === "write" ? "写入" : "读取"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removePermission(perm.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {permissions.filter(p => p.keyId === permKeyId).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-gray-500">暂无权限配置</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="border-t pt-4 space-y-3">
              <Label className="text-sm font-medium">添加权限</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="用户" value={permUser} onChange={(e) => setPermUser(e.target.value)} />
                <Input placeholder="角色" value={permRole} onChange={(e) => setPermRole(e.target.value)} />
                <select
                  value={permLevel}
                  onChange={(e) => setPermLevel(e.target.value as "read" | "write" | "admin")}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="read">读取</option>
                  <option value="write">写入</option>
                  <option value="admin">管理</option>
                </select>
              </div>
              <Button size="sm" onClick={addPermission} disabled={!permUser || !permRole}>
                <Plus className="w-3 h-3 mr-1" />添加
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={drawerType === "key" ? "密钥详情" : drawerType === "cert" ? "证书详情" : drawerType === "crl" ? "吊销详情" : "生命周期详情"}
        data={drawerItem || {}}
        fields={getDrawerFields()}
        onEdit={() => {
          setDrawerOpen(false);
          openDialog(drawerType === "key" || drawerType === "lifecycle" ? "key" : "cert", "edit", drawerItem);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          openDialog(drawerType === "key" || drawerType === "lifecycle" ? "key" : "cert", "delete", drawerItem);
        }}
      />
    </div>
  );
}
