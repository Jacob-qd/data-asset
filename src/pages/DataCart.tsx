import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/DataTable";
import { Search, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DataResource {
  id: string;
  name: string;
  type: string;
  provider: string;
  level: string;
  description: string;
}

const mockResources: DataResource[] = [
  {
    id: "RES-001",
    name: "乳腺癌诊疗图片-host",
    type: "库表",
    provider: "神思电子",
    level: "重要数据",
    description: "乳腺癌诊疗相关图片数据，用于医学影像分析",
  },
  {
    id: "RES-002",
    name: "乳腺癌诊疗标定图片-guest",
    type: "公共数据资源",
    provider: "济南大数据集团",
    level: "一般数据（4级）",
    description: "标定后的乳腺癌诊疗图片数据",
  },
  {
    id: "RES-003",
    name: "济南市热力用户信息",
    type: "公共数据资源",
    provider: "济南能源集团",
    level: "一般数据（3级）",
    description: "热力用户基本信息及用热数据",
  },
  {
    id: "RES-004",
    name: "车辆监管及线索数据",
    type: "公共数据资源",
    provider: "济南市大数据局",
    level: "一般数据（1级）",
    description: "车辆监管信息及线索数据",
  },
  {
    id: "RES-005",
    name: "企业基本信息查询接口",
    type: "公共数据资源",
    provider: "济南市大数据局",
    level: "一般数据（1级）",
    description: "企业工商注册信息查询接口",
  },
];

export default function DataCart() {
  const [cart, setCart] = useState<DataResource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());

  const filteredResources = mockResources.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedResources);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedResources(newSet);
  };

  const handleAddToCart = () => {
    const selected = mockResources.filter((r) => selectedResources.has(r.id));
    setCart([...cart, ...selected.filter((r) => !cart.find((c) => c.id === r.id))]);
    toast.success(`已添加 ${selected.length} 个数据资源到选数车`);
    setSelectedResources(new Set());
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter((r) => r.id !== id));
    toast.success("已从选数车移除");
  };

  const columns = [
    {
      key: "select",
      title: "",
      width: "w-10",
      render: (row: DataResource) => (
        <Checkbox
          checked={selectedResources.has(row.id)}
          onCheckedChange={() => handleToggleSelect(row.id)}
        />
      ),
    },
    { key: "name", title: "资源名称" },
    { key: "type", title: "资源类型", render: (row: DataResource) => <Badge variant="outline">{row.type}</Badge> },
    { key: "provider", title: "数据提供方" },
    { key: "level", title: "数据分级", render: (row: DataResource) => <Badge variant="secondary">{row.level}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold">选数车</h1>
          {cart.length > 0 && (
            <Badge className="bg-indigo-100 text-indigo-700">{cart.length}</Badge>
          )}
        </div>
        {cart.length > 0 && (
          <Button onClick={() => window.location.href = "#/scenes/create"}>
            <ArrowRight className="w-4 h-4 mr-2" />
            去创建场景
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索数据资源..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={selectedResources.size === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              加入选数车 ({selectedResources.size})
            </Button>
          </div>

          <DataTable
            data={filteredResources}
            columns={columns}
            rowKey={(row) => row.id}
          />
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">已选资源 ({cart.length})</h3>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">选数车为空</p>
                  <p className="text-xs mt-1">请从左侧选择数据资源</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.provider}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 shrink-0"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}