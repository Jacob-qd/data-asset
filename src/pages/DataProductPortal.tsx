import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search, ShoppingCart, Eye, Star, Download,
  Filter, TrendingUp, Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DataProduct {
  id: string;
  name: string;
  provider: string;
  type: string;
  industry: string;
  price: string;
  rating: number;
  downloads: number;
  description: string;
  tags: string[];
}

const mockProducts: DataProduct[] = [
  {
    id: "PROD-001",
    name: "乳腺癌筛查API",
    provider: "济南大数据集团",
    type: "API产品",
    industry: "医疗健康",
    price: "¥5000/月",
    rating: 4.8,
    downloads: 234,
    description: "基于联邦学习的乳腺癌风险评分API，支持多方数据联合建模",
    tags: ["联邦学习", "医疗健康", "API"],
  },
  {
    id: "PROD-002",
    name: "城市治理分析报告",
    provider: "济南大数据集团",
    type: "数据报告",
    industry: "城市治理",
    price: "¥2000/份",
    rating: 4.5,
    downloads: 156,
    description: "多维度城市治理数据分析报告，涵盖交通、环境、人口等",
    tags: ["城市治理", "数据分析", "报告"],
  },
  {
    id: "PROD-003",
    name: "气象数据服务",
    provider: "济南大数据集团",
    type: "数据集",
    industry: "气象服务",
    price: "¥1000/月",
    rating: 4.2,
    downloads: 89,
    description: "历史气象数据集合，支持按地区、时间段查询",
    tags: ["气象", "数据集", "历史数据"],
  },
  {
    id: "PROD-004",
    name: "公积金缴存分析",
    provider: "山东轨道集团",
    type: "API产品",
    industry: "金融服务",
    price: "¥3000/月",
    rating: 4.6,
    downloads: 178,
    description: "公积金缴存情况查询与分析API",
    tags: ["金融", "公积金", "API"],
  },
  {
    id: "PROD-005",
    name: "车辆监管数据",
    provider: "济南市大数据局",
    type: "数据接口",
    industry: "交通运输",
    price: "免费",
    rating: 4.0,
    downloads: 567,
    description: "车辆监管及线索数据查询接口",
    tags: ["交通", "免费", "公共数据"],
  },
  {
    id: "PROD-006",
    name: "企业基本信息查询",
    provider: "济南市大数据局",
    type: "API产品",
    industry: "企业服务",
    price: "免费",
    rating: 4.3,
    downloads: 892,
    description: "企业工商信息、信用信息查询API",
    tags: ["企业", "免费", "公共数据"],
  },
];

const industries = ["全部", "医疗健康", "城市治理", "气象服务", "金融服务", "交通运输", "企业服务"];
const types = ["全部", "API产品", "数据报告", "数据集", "数据接口"];

export default function DataProductPortal() {
  const [products] = useState<DataProduct[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("全部");
  const [selectedType, setSelectedType] = useState("全部");

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchIndustry = selectedIndustry === "全部" || p.industry === selectedIndustry;
    const matchType = selectedType === "全部" || p.type === selectedType;
    return matchSearch && matchIndustry && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">数据产品门户</h1>
          <p className="text-indigo-100 mb-6">培育数据要素市场，赋能千行百业。发现、购买和使用优质数据产品。</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="搜索数据产品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white text-gray-900 border-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">行业分类：</span>
          {industries.map((industry) => (
            <Badge
              key={industry}
              variant={selectedIndustry === industry ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedIndustry(industry)}
            >
              {industry}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">产品类型：</span>
          {types.map((type) => (
            <Badge
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>共 {filteredProducts.length} 个数据产品</span>
        <div className="flex items-center gap-4">
          <span className="cursor-pointer hover:text-gray-700">智能推荐</span>
          <span className="cursor-pointer hover:text-gray-700">发布时间 ↓</span>
          <span className="cursor-pointer hover:text-gray-700">点击量</span>
          <span className="cursor-pointer hover:text-gray-700">评分</span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">{product.provider}</CardDescription>
                </div>
                <Badge variant="outline">{product.type}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

              <div className="flex items-center gap-1">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">{product.downloads}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", product.price === "免费" ? "text-green-600" : "text-indigo-600")}>
                    {product.price}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info("查看详情")}>
                  <Eye className="w-4 h-4 mr-1" />查看
                </Button>
                <Button size="sm" className="flex-1" onClick={() => toast.success("已添加到购物车")}>
                  <ShoppingCart className="w-4 h-4 mr-1" />购买
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
