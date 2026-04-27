import { useEffect, useRef, useState, useCallback } from "react";
import CountUp from "react-countup";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Search,
  Database,
  MessageCircleQuestion,
  FileCheck,
  Building2,
  ScrollText,
  Newspaper,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Gavel,
  TrendingUp,
  Landmark,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  BarChart3,
  Users,
  ShoppingCart,
  CheckCircle2,
  Play,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  useInView — IntersectionObserver hook for scroll animations       */
/* ------------------------------------------------------------------ */
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  AnimatedSection wrapper                                           */
/* ------------------------------------------------------------------ */
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                         */
/* ------------------------------------------------------------------ */

const METRICS = [
  { value: 1200, suffix: "+", label: "交易主体", icon: Users },
  { value: 3500, suffix: "+", label: "数据商品", icon: ShoppingCart },
  { value: 8900, suffix: "+", label: "已登记数据", icon: Database },
  { value: 2.8, suffix: "亿", label: "撮合交易", prefix: "¥", icon: TrendingUp, decimals: 1 },
];

const SERVICES = [
  {
    icon: FileCheck,
    title: "数据资产登记",
    desc: "规范的数据资产登记流程，支持在线申请、审核、公示，确保资产权属清晰可追溯。",
    bg: "bg-[#FFFBEB]",
    color: "text-[#F59E0B]",
    hoverBorder: "hover:border-[#F59E0B]/40",
  },
  {
    icon: MessageCircleQuestion,
    title: "资产化咨询",
    desc: "专业的数据资产化咨询服务，帮助企业梳理数据资源，制定资产化路径和落地方案。",
    bg: "bg-[#ECFDF5]",
    color: "text-[#10B981]",
    hoverBorder: "hover:border-[#10B981]/40",
  },
  {
    icon: Building2,
    title: "服务机构入驻",
    desc: "汇聚优质数据服务商，提供数据清洗、建模、分析、评估等专业服务入驻通道。",
    bg: "bg-[#F0F9FF]",
    color: "text-[#3B82F6]",
    hoverBorder: "hover:border-[#3B82F6]/40",
  },
  {
    icon: ScrollText,
    title: "登记公示查询",
    desc: "公开透明的资产登记信息公示平台，保障数据资产交易的公平性和可信度。",
    bg: "bg-[#FFF1F2]",
    color: "text-[#F43F5E]",
    hoverBorder: "hover:border-[#F43F5E]/40",
  },
  {
    icon: Newspaper,
    title: "政策资讯",
    desc: "最新数据资产相关政策法规、行业动态、标准规范，助力企业合规运营。",
    bg: "bg-[#F5F3FF]",
    color: "text-[#8B5CF6]",
    hoverBorder: "hover:border-[#8B5CF6]/40",
  },
  {
    icon: BarChart3,
    title: "数据产品交易",
    desc: "安全合规的数据产品交易平台，实现数据资产的高效流通与价值变现。",
    bg: "bg-[#EEF2FF]",
    color: "text-[#6366F1]",
    hoverBorder: "hover:border-[#6366F1]/40",
  },
];

const STEPS = [
  {
    num: "01",
    title: "资产梳理",
    desc: "全面盘点企业数据资源，识别可资产化的数据要素",
    icon: ClipboardList,
  },
  {
    num: "02",
    title: "合规审查",
    desc: "对数据进行合规性审查，确保数据来源合法合规",
    icon: Gavel,
  },
  {
    num: "03",
    title: "资产评估",
    desc: "专业评估机构对数据资产进行价值评估和定价",
    icon: TrendingUp,
  },
  {
    num: "04",
    title: "资产入表",
    desc: "完成数据资产登记入表，实现资产化管理和运营",
    icon: CheckCircle2,
  },
];

const REGISTRATIONS = [
  {
    name: "某市公共信用信息数据集",
    type: "信用数据",
    date: "2026-04-10",
    value: 2560,
    status: "已公示",
    statusColor: "bg-[#ECFDF5] text-[#059669]",
    code: "DA-2026-0410-001",
  },
  {
    name: "医疗健康大数据资产包",
    type: "医疗数据",
    date: "2026-04-08",
    value: 1890,
    status: "公示中",
    statusColor: "bg-[#EFF6FF] text-[#2563EB]",
    code: "DA-2026-0408-002",
  },
  {
    name: "交通出行轨迹数据集",
    type: "交通数据",
    date: "2026-04-05",
    value: 980,
    status: "已公示",
    statusColor: "bg-[#ECFDF5] text-[#059669]",
    code: "DA-2026-0405-003",
  },
  {
    name: "教育资源共享数据集",
    type: "教育数据",
    date: "2026-04-03",
    value: 1230,
    status: "已公示",
    statusColor: "bg-[#ECFDF5] text-[#059669]",
    code: "DA-2026-0403-004",
  },
  {
    name: "环境监测数据集",
    type: "环境数据",
    date: "2026-03-28",
    value: 756,
    status: "公示中",
    statusColor: "bg-[#EFF6FF] text-[#2563EB]",
    code: "DA-2026-0328-005",
  },
  {
    name: "金融服务数据集",
    type: "金融数据",
    date: "2026-03-25",
    value: 3450,
    status: "已公示",
    statusColor: "bg-[#ECFDF5] text-[#059669]",
    code: "DA-2026-0325-006",
  },
];

const NEWS_FEATURED = {
  tag: "重磅",
  title: "《企业数据资源相关会计处理暂行规定》正式施行",
  summary:
    "财政部正式发布企业数据资源相关会计处理暂行规定，明确数据资源入表条件，为企业数据资产化提供制度保障...",
  date: "2026-04-12",
};

const NEWS_LIST = [
  { tag: "政策", title: "数据要素市场化配置综合改革实施方案", date: "2026-04-10" },
  { tag: "行业", title: "全国数据交易联盟成立，推动数据要素流通", date: "2026-04-08" },
  { tag: "标准", title: "数据资产评估指南国家标准发布", date: "2026-04-05" },
  { tag: "政策", title: "数据安全法实施细则征求意见稿", date: "2026-04-01" },
];

const INSTITUTIONS = [
  ["中软国际", "浪潮集团", "用友网络", "金蝶软件"],
  ["太极股份", "东软集团", "宝信软件", "神州数码"],
  ["易华录", "拓尔思", "银江技术", "千方科技"],
  ["卫宁健康", "创业慧康", "万达信息", "华宇软件"],
];

const HOT_TAGS = ["企业工商数据", "信用评价", "医疗健康", "金融服务"];

/* ------------------------------------------------------------------ */
/*  Main Portal Component                                              */
/* ------------------------------------------------------------------ */
export default function Portal() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [countStarted, setCountStarted] = useState(false);

  /* ---- Hero entrance animation ---- */
  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  /* ---- Scroll-triggered countUp ---- */
  const { ref: metricsRef, inView: metricsInView } = useInView();
  useEffect(() => {
    if (metricsInView) setCountStarted(true);
  }, [metricsInView]);

  /* ---- Carousel setup ---- */
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true, slidesToScroll: 1 },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
      setSelectedIdx(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi]);

  /* ---- Navigation scroll shadow ---- */
  const [navScrolled, setNavScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="-m-6 min-w-[1024px]">
      {/* ============================================================ */}
      {/*  Simplified Navigation Bar                                     */}
      {/* ============================================================ */}
      <nav
        className={`sticky top-0 z-50 h-16 bg-white border-b border-slate-200 flex items-center px-8 transition-shadow duration-200 ${
          navScrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2 mr-10">
          <img src="./logo.svg" alt="Logo" className="w-8 h-8" />
          <span className="text-h5 font-bold text-slate-800">数据资产服务平台</span>
        </div>
        <div className="flex items-center gap-8 flex-1">
          {["首页", "资产目录", "服务机构", "登记公示", "政策资讯", "帮助中心"].map(
            (item, i) => (
              <a
                key={item}
                href="#"
                className={`text-sm text-slate-600 hover:text-primary-600 transition-colors relative py-5 ${
                  i === 0 ? "text-primary-600 font-medium" : ""
                }`}
              >
                {item}
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                )}
              </a>
            )
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-sm text-slate-600 hover:text-primary-600 transition-colors px-3 py-1.5"
          >
            登录
          </button>
          <button
            type="button"
            className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors px-4 py-2 rounded-md"
          >
            免费注册
          </button>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  Hero Banner Section                                           */}
      {/* ============================================================ */}
      <section
        ref={heroRef}
        className="relative w-full h-[480px] flex items-center justify-center overflow-hidden"
      >
        {/* Background image */}
        <img
          src="./portal-hero.png"
          alt="Portal Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.45))",
          }}
        />
        {/* Floating particles (CSS) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: `${4 + (i % 4) * 3}px`,
                height: `${4 + (i % 4) * 3}px`,
                left: `${(i * 7.5) % 100}%`,
                bottom: `-${10 + (i % 3) * 5}%`,
                animation: `floatUp ${10 + (i % 5) * 3}s linear ${i * 0.7}s infinite`,
                opacity: 0.25,
              }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {/* Title */}
          <h1
            className="text-display text-white font-bold"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
            }}
          >
            让数据成为核心资产
          </h1>
          {/* Subtitle */}
          <p
            className="text-h3 text-slate-300 font-normal mt-4"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s",
            }}
          >
            一站式数据资产管理与服务，助力企业释放数据价值
          </p>

          {/* Search bar */}
          <div
            className="mt-8 flex items-center w-full max-w-[640px] mx-auto h-14 rounded-full bg-white shadow-lg overflow-hidden"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "scale(1)" : "scale(0.95)",
              transition: "opacity 0.5s ease-out 0.4s, transform 0.5s ease-out 0.4s",
            }}
          >
            <Search className="w-5 h-5 text-slate-400 ml-5 flex-shrink-0" />
            <input
              type="text"
              placeholder="搜索数据资产、服务机构、政策法规..."
              className="flex-1 h-full px-3 text-sm text-slate-700 outline-none bg-transparent"
            />
            <button
              type="button"
              className="h-10 px-6 mr-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors flex-shrink-0"
            >
              搜索
            </button>
          </div>

          {/* Hot tags */}
          <div
            className="mt-4 flex items-center justify-center gap-2 flex-wrap"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 0.5s ease-out 0.6s",
            }}
          >
            <span className="text-sm text-slate-400">热门搜索：</span>
            {HOT_TAGS.map((tag, i) => (
              <button
                key={tag}
                type="button"
                className="px-3 py-1 rounded-full text-sm text-white bg-white/15 hover:bg-primary-500 transition-colors"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transition: `opacity 0.4s ease-out ${0.65 + i * 0.08}s`,
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Hero stats */}
          <div
            className="mt-10 flex items-center justify-center gap-12"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 0.5s ease-out 0.8s",
            }}
          >
            {[
              { num: "12,000+", label: "注册资产" },
              { num: "500+", label: "服务机构" },
              { num: "2,000+", label: "企业用户" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-h2 text-white font-bold font-mono">{s.num}</div>
                <div className="text-sm text-slate-300 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Core Metrics Bar                                               */}
      {/* ============================================================ */}
      <section ref={metricsRef} className="w-full bg-slate-50 py-10 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8">
          {METRICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <AnimatedSection key={m.label} delay={i * 0.1}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-h2 font-bold font-mono text-slate-800">
                      {countStarted ? (
                        <CountUp
                          start={0}
                          end={m.value}
                          duration={1.5}
                          decimals={m.decimals ?? 0}
                          prefix={m.prefix ?? ""}
                          suffix={m.suffix}
                          separator=","
                        />
                      ) : (
                        `${m.prefix ?? ""}0${m.suffix}`
                      )}
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">{m.label}</div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Service Entry Grid (6 cards)                                  */}
      {/* ============================================================ */}
      <section className="w-full bg-white py-16 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Title area */}
          <AnimatedSection className="text-center mb-10">
            <span className="text-caption font-semibold text-primary-500 uppercase tracking-wider">
              平台服务
            </span>
            <h2 className="text-h2 text-slate-800 mt-2">全方位数据资产服务</h2>
            <p className="text-body text-slate-500 mt-2">
              覆盖数据资产化全生命周期，从咨询到变现
            </p>
          </AnimatedSection>

          {/* Grid */}
          <div className="grid grid-cols-3 gap-6">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <AnimatedSection key={s.title} delay={i * 0.1}>
                  <div
                    className={`group bg-white border border-slate-200 rounded-xl p-8 shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${s.hoverBorder} hover:border-primary-300`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl ${s.bg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105`}
                    >
                      <Icon className={`w-7 h-7 ${s.color}`} />
                    </div>
                    <h3 className="text-h4 text-slate-800 mb-2">{s.title}</h3>
                    <p className="text-body-small text-slate-500 leading-relaxed mb-4">
                      {s.desc}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700 transition-colors">
                      了解更多
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  4-Step Process Flow                                            */}
      {/* ============================================================ */}
      <section
        className="w-full py-16 px-8"
        style={{ background: "linear-gradient(to right, #4F46E5, #3730A3)" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <AnimatedSection className="text-center mb-12">
            <span className="text-caption font-semibold text-primary-200 uppercase tracking-wider">
              服务流程
            </span>
            <h2 className="text-h2 text-white mt-2">四步完成数据资产化</h2>
            <p className="text-body text-primary-200 mt-2">
              专业团队全程指导，高效完成数据资产化转型
            </p>
          </AnimatedSection>

          {/* Steps */}
          <div className="flex items-start justify-center gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex items-center">
                  <AnimatedSection
                    delay={i * 0.15}
                    className="flex flex-col items-center text-center w-52"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mb-4">
                      <Icon className="w-9 h-9 text-white" />
                    </div>
                    <span className="text-h3 text-primary-200 font-mono">{step.num}</span>
                    <h4 className="text-h4 text-white mt-1 mb-2">{step.title}</h4>
                    <p className="text-sm text-primary-200 leading-relaxed">{step.desc}</p>
                  </AnimatedSection>
                  {i < STEPS.length - 1 && (
                    <div className="flex items-center self-start mt-10 mx-2">
                      <ArrowRight className="w-6 h-6 text-white/60" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <AnimatedSection className="text-center mt-12" delay={0.6}>
            <button
              type="button"
              className="h-12 px-10 rounded-full bg-white text-primary-600 font-semibold text-base hover:bg-primary-50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              立即咨询
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Latest Registration Carousel                                  */}
      {/* ============================================================ */}
      <section className="w-full bg-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <AnimatedSection className="flex items-center justify-between mb-8">
            <h2 className="text-h2 text-slate-800">最新登记公示</h2>
            <a
              href="#"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              查看全部
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </AnimatedSection>

          {/* Carousel */}
          <AnimatedSection delay={0.1}>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {REGISTRATIONS.map((item) => (
                  <div
                    key={item.code}
                    className="flex-none w-[calc(33.333%-16px)] mr-6 min-w-[300px]"
                  >
                    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.statusColor}`}
                        >
                          {item.status}
                        </span>
                        <span className="text-caption text-slate-400">{item.date}</span>
                      </div>
                      <h4 className="text-h5 text-slate-800 font-semibold mb-1 truncate">
                        {item.name}
                      </h4>
                      <p className="text-caption text-slate-500 mb-3">{item.type}</p>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-h4 text-primary-600 font-bold font-mono">
                          {item.value.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-500">万元</span>
                      </div>
                      <div className="text-caption text-slate-400 font-mono pt-3 border-t border-slate-100">
                        {item.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={scrollPrev}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-primary-100 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-2">
                {REGISTRATIONS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      selectedIdx === i ? "bg-primary-500" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={scrollNext}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-primary-100 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Policy News Section                                            */}
      {/* ============================================================ */}
      <section className="w-full bg-slate-50 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <AnimatedSection className="flex items-center justify-between mb-8">
            <h2 className="text-h2 text-slate-800">政策资讯</h2>
            <a
              href="#"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              查看更多
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </AnimatedSection>

          {/* Content: left-right split */}
          <div className="flex gap-8">
            {/* Left — Featured */}
            <AnimatedSection
              className="flex-[3] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
              delay={0}
            >
              <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-20 h-20 border border-white/30 rounded-full" />
                  <div className="absolute bottom-6 right-8 w-32 h-32 border border-white/20 rounded-full" />
                  <div className="absolute top-8 right-12 w-12 h-12 border border-white/25 rounded-full" />
                </div>
                <Newspaper className="w-16 h-16 text-white/60 relative z-10" />
                <span className="absolute top-4 left-4 text-xs px-2 py-1 rounded-full bg-red-500 text-white font-medium">
                  {NEWS_FEATURED.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-h3 text-slate-800 font-semibold group-hover:text-primary-600 transition-colors leading-snug">
                  {NEWS_FEATURED.title}
                </h3>
                <p className="text-body text-slate-500 mt-3 line-clamp-2">
                  {NEWS_FEATURED.summary}
                </p>
                <span className="text-caption text-slate-400 mt-4 block">
                  {NEWS_FEATURED.date}
                </span>
              </div>
            </AnimatedSection>

            {/* Right — News list */}
            <div className="flex-[2] flex flex-col">
              {NEWS_LIST.map((news, i) => (
                <AnimatedSection key={i} delay={0.1 + i * 0.1}>
                  <a
                    href="#"
                    className={`group flex flex-col py-4 ${
                      i < NEWS_LIST.length - 1 ? "border-b border-slate-200" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          news.tag === "政策"
                            ? "bg-[#EFF6FF] text-[#2563EB]"
                            : news.tag === "行业"
                            ? "bg-[#ECFDF5] text-[#059669]"
                            : "bg-[#FFFBEB] text-[#D97706]"
                        }`}
                      >
                        {news.tag}
                      </span>
                      <span className="text-caption text-slate-400">{news.date}</span>
                    </div>
                    <h5 className="text-h5 text-slate-800 group-hover:text-primary-600 transition-colors truncate">
                      {news.title}
                    </h5>
                  </a>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Service Institutions Section                                  */}
      {/* ============================================================ */}
      <section className="w-full bg-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-h2 text-slate-800">入驻服务机构</h2>
            <p className="text-body text-slate-500 mt-2">
              汇聚行业优质服务商，提供专业数据服务
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-4 gap-4">
            {INSTITUTIONS.flat().map((name, i) => (
              <AnimatedSection key={name} delay={i * 0.05}>
                <div className="h-20 bg-slate-50 rounded-lg flex items-center justify-center hover:bg-primary-50 hover:shadow-md transition-all cursor-pointer group">
                  <span className="text-sm font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                    {name}
                  </span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Custom Footer                                                  */}
      {/* ============================================================ */}
      <footer className="w-full bg-slate-900 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-8">
            {/* Column 1 - Platform Info */}
            <AnimatedSection delay={0}>
              <div className="flex items-center gap-2 mb-4">
                <img src="./logo.svg" alt="Logo" className="w-7 h-7" />
                <span className="text-h5 font-semibold text-slate-100">数据资产服务平台</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                面向政企客户的一站式数据资产管理与服务，助力企业释放数据价值，实现数字化转型。
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span>400-888-9999</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>service@damp.com</span>
                </div>
              </div>
            </AnimatedSection>

            {/* Column 2 - Services */}
            <AnimatedSection delay={0.1}>
              <h4 className="text-sm font-semibold text-slate-200 mb-4">平台服务</h4>
              <ul className="space-y-2.5">
                {["数据资产目录", "资产化咨询", "数据资产登记", "服务机构入驻"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-slate-400 hover:text-primary-400 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </AnimatedSection>

            {/* Column 3 - Support */}
            <AnimatedSection delay={0.2}>
              <h4 className="text-sm font-semibold text-slate-200 mb-4">帮助支持</h4>
              <ul className="space-y-2.5">
                {["使用指南", "API 文档", "常见问题", "意见反馈"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-primary-400 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </AnimatedSection>

            {/* Column 4 - About */}
            <AnimatedSection delay={0.3}>
              <h4 className="text-sm font-semibold text-slate-200 mb-4">关于我们</h4>
              <ul className="space-y-2.5">
                {["平台介绍", "发展历程", "合作伙伴", "联系我们"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-primary-400 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              &copy; 2026 数据资产服务平台 版权所有
            </p>
            <p className="text-sm text-slate-500">京ICP备2026000001号-1</p>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*  Keyframe animations (injected style)                         */}
      {/* ============================================================ */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 0.25;
          }
          90% {
            opacity: 0.25;
          }
          100% {
            transform: translateY(-520px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
