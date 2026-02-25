"use client"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Activity, 
  BarChart3, 
  Mail, 
  DollarSign 
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { div } from "framer-motion/client";

// ── Mock Data ────────────────────────────────────────────────
const revenueTrend = [
  { month: "Aug", revenue: 3000 },
  { month: "Sep", revenue: 3400 },
  { month: "Oct", revenue: 4100 },
  { month: "Nov", revenue: 4300 },
  { month: "Dec", revenue: 4500 },
  { month: "Jan",  revenue: 4320 },
  { month: "Feb",  revenue: 4800 },
];

const subscriptionData = [
  { name: "Free Users", value: 76, color: "#6b7280" },
  { name: "Premium Monthly", value: 15, color: "#f59e0b" },
  { name: "Premium Yearly", value: 9, color: "#10b981" },
];

const COLORS = ["#6b7280", "#f59e0b", "#10b981"];

// Animation Variants with proper typing
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { 
    y: 20, 
    opacity: 0 
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const chartVariants: Variants = {
  hidden: { 
    scale: 0.95, 
    opacity: 0 
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay: 0.3,
    },
  },
};

// ── Stat Card Component ─────────────────────────────────────
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  index?: number;
};

function StatCard({ title, value, icon, trend, trendUp = true, className, index = 0 }: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ 
        scale: 1.02,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10,
        },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={cn("relative overflow-hidden transition-shadow duration-300 hover:shadow-xl", className)}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <motion.div 
            className="h-5 w-5 text-muted-foreground"
            whileHover={{ rotate: 15, scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {icon}
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-2xl font-bold"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.05, type: "spring", stiffness: 100 }}
          >
            {value}
          </motion.div>
          {trend && (
            <motion.p 
              className={cn(
                "text-xs mt-1 flex items-center gap-1",
                trendUp ? "text-emerald-600" : "text-rose-600"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <motion.span
                animate={{ 
                  y: trendUp ? [0, -3, 0] : [0, 3, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2, 
                  ease: "easeInOut",
                }}
              >
                {trendUp ? "↑" : "↓"}
              </motion.span>
              {trend}
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────
export default function DashboardOverview() {
  return (
    <motion.div 
      className="flex min-h-screen flex-col"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex-1 space-y-6">
        <motion.div 
          className="flex flex-col"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-[30px] font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            Dashboard Overview
          </motion.h1> 
          <motion.p 
            className="text-[#4A5565]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Quick system snapshot and app health
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          variants={containerVariants}
        >
          <StatCard
            title="Total Users"
            value="2,847"
            icon={<div className="jbg" ><Users className="h-5 w-5 " /></div>}
            className="bg-gradient-to-br from-blue-50 to-blue-100/40 border-blue-200"
            index={0}
          />
          <StatCard
            title="Active Users"
            value="1,923"
            icon={<Activity className="h-5 w-5" />}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 border-emerald-200"
            index={1}
          />
          <StatCard
            title="Total Simulations Run"
            value="18,342"
            icon={<BarChart3 className="h-5 w-5" />}
            className="bg-gradient-to-br from-purple-50 to-purple-100/40 border-purple-200"
            index={2}
          />
          <StatCard
            title="New Support Messages"
            value="12"
            icon={<Mail className="h-5 w-5" />}
            className="bg-gradient-to-br from-rose-50 to-rose-100/40 border-rose-200"
            index={3}
          />
          <StatCard
            title="Total Revenue"
            value="$47,856"
            icon={<DollarSign className="h-5 w-5" />}
            trend="↑ 15.6% from last month"
            trendUp
            index={4}
          />
          <StatCard
            title="Monthly Revenue"
            value="$4,320"
            icon={<DollarSign className="h-5 w-5" />}
            trend="↑ 8.3% from last month"
            trendUp
            index={5}
          />
        </motion.div>

        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-7"
          variants={containerVariants}
        >
          {/* Revenue Trend */}
          <motion.div 
            className="col-span-4"
            variants={chartVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
              <CardHeader>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                  <CardDescription>Last 7 months revenue performance</CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="pl-2">
                <motion.div 
                  className="h-[320px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueTrend}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number | string | undefined) => {
                          if (value === undefined) return ["$0", "Revenue"];
                          if (typeof value === 'number') {
                            return [`$${value.toLocaleString()}`, "Revenue"];
                          }
                          return [value, "Revenue"];
                        }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.2}
                        isAnimationActive={true}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Distribution */}
          <motion.div 
            className="col-span-3"
            variants={chartVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
              <CardHeader>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <CardTitle>Subscription Distribution</CardTitle>
                  <CardDescription>User breakdown by plan type</CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="h-[300px] w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 100 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent = 0 }) => {
                          const percentage = Math.round(percent * 100);
                          return `${name}: ${percentage}%`;
                        }}
                        labelLine={{ stroke: '#666', strokeWidth: 1 }}
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number | string | undefined) => {
                          if (typeof value === 'number') {
                            return [`${value}%`, 'Percentage'];
                          }
                          return [value, 'Percentage'];
                        }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Custom Legend */}
                <motion.div 
                  className="mt-4 grid grid-cols-1 gap-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.6,
                      },
                    },
                  }}
                >
                  {subscriptionData.map((item, index) => (
                    <motion.div
                      key={item.name}
                      variants={{
                        hidden: { x: 20, opacity: 0 },
                        visible: { 
                          x: 0, 
                          opacity: 1,
                          transition: { type: "spring", stiffness: 100 }
                        },
                      }}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between text-sm p-1 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <motion.div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index] }}
                          whileHover={{ scale: 1.5 }}
                          animate={{ 
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 2,
                            delay: index * 0.5,
                            ease: "easeInOut",
                          }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{item.value}%</span>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge 
                            variant="outline" 
                            className="bg-opacity-50 cursor-default"
                            style={{ 
                              borderColor: COLORS[index],
                              color: COLORS[index]
                            }}
                          >
                            {item.value} users
                          </Badge>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}