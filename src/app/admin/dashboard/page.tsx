"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, Calendar, UtensilsCrossed, ShieldCheck, LogOut, 
  Settings, IndianRupee, Users, CheckCircle, XCircle, AlertTriangle, 
  Plus, Trash2, Edit, Check, X, Shield, Star, Bell, FileText, 
  Clock, Info, ChevronLeft, ChevronRight, Upload, HelpCircle, 
  TrendingUp, UserCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { LuxuryButton } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { StatCardSkeleton, TableSkeleton } from "@/components/atoms/Skeletons";

type DashboardTab = 
  | "overview" 
  | "orders" 
  | "reservations" 
  | "menu" 
  | "customers" 
  | "reviews" 
  | "notifications" 
  | "settings" 
  | "audit";

interface StatsType {
  revenue: { daily: number; weekly: number; monthly: number; yearly: number };
  averageOrderValue: number;
  orders: { PENDING: number; ACTIVE: number; COMPLETED: number; CANCELLED: number };
  reservations: { PENDING: number; APPROVED: number; REJECTED: number; CANCELLED: number };
  reservationConversionRate: number;
  tableUtilization: number;
  averageTableOccupancy: number;
  customers: { total: number; new: number; returning: number };
  popularDishes: Array<{ name: string; quantity: number; revenue: number }>;
  leastOrderedDishes: Array<{ name: string; quantity: number; revenue: number }>;
  trends: Array<{ date: string; orders: number; reservations: number }>;
}

interface TableType {
  id: string;
  number: number;
  capacity: number;
  status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "MAINTENANCE";
}

interface ReservationType {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  tableId: string | null;
  table: { number: number } | null;
}

interface OrderType {
  id: string;
  totalAmount: number;
  status: string;
  notes: string | null;
  createdAt: string;
  customer: { name: string; phone: string; email: string };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    menuItem: { name: string };
  }>;
}

interface MenuItemType {
  id: string;
  name: string;
  teluguName: string | null;
  isVeg: boolean;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  prepTime: number;
  categoryId: string;
  category: { name: string };
  ingredients: Array<{ id: string; name: string; quantity: number; unit: string; isAvailable: boolean }>;
}

interface CustomerStatsType {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpending: number;
  lastOrderDate: string | null;
  reservationCount: number;
  orders: Array<{ id: string; totalAmount: number; status: string; createdAt: string }>;
  reservations: Array<{ id: string; date: string; time: string; guests: number; status: string }>;
}

interface ReviewType {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  isFeatured: boolean;
  orderId: string | null;
  createdAt: string;
}

interface NotificationType {
  id: string;
  type: string;
  priority: "INFO" | "WARNING" | "CRITICAL";
  status: "UNREAD" | "READ" | "ARCHIVED";
  message: string;
  createdAt: string;
}

interface AuditLogType {
  id: string;
  userId: string | null;
  user: { name: string; email: string } | null;
  role: string | null;
  action: string;
  details: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, checking } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [stats, setStats] = useState<StatsType | null>(null);
  const [tables, setTables] = useState<TableType[]>([]);
  const [reservations, setReservations] = useState<ReservationType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [customers, setCustomers] = useState<CustomerStatsType[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [reviewAnalytics, setReviewAnalytics] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
  const [totalAuditCount, setTotalAuditCount] = useState(0);
  const [auditPage, setAuditPage] = useState(1);

  // Settings Configuration states
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<"general" | "ordering" | "reservations" | "notifications" | "branding">("general");

  // Selected Item Modals & Forms States
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerStatsType | null>(null);
  
  // Menu Item Form State
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItemType | null>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuFormName, setMenuFormName] = useState("");
  const [menuFormTeluguName, setMenuFormTeluguName] = useState("");
  const [menuFormIsVeg, setMenuFormIsVeg] = useState(true);
  const [menuFormDesc, setMenuFormDesc] = useState("");
  const [menuFormPrice, setMenuFormPrice] = useState("");
  const [menuFormPrep, setMenuFormPrep] = useState("15");
  const [menuFormCat, setMenuFormCat] = useState("");
  const [menuFormFeatured, setMenuFormFeatured] = useState(false);
  const [menuFormAvailable, setMenuFormAvailable] = useState(true);
  const [menuFormIngs, setMenuFormIngs] = useState<Array<{ name: string; quantity: number; unit: string }>>([]);
  const [newIngName, setNewIngName] = useState("");
  const [newIngQty, setNewIngQty] = useState("100");
  const [newIngUnit, setNewIngUnit] = useState("grams");
  
  // Image Upload temporary state
  const [menuFormImage, setMenuFormImage] = useState<string | null>(null);
  const [menuFormImageName, setMenuFormImageName] = useState<string | null>(null);

  // Search/Filter states
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerMinSpending, setCustomerMinSpending] = useState(0);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCatFilter, setMenuCatFilter] = useState("ALL");
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const [loading, setLoading] = useState(true);

  // Security Check: Redirect if not Admin
  useEffect(() => {
    if (!checking && (!user || user.role !== "ADMIN")) {
      router.push("/admin/login");
    }
  }, [user, checking, router]);

  const fetchData = async () => {
    if (!user || user.role !== "ADMIN") return;
    setLoading(true);
    try {
      const statsRes = await fetch("/api/admin/stats");
      const tablesRes = await fetch("/api/admin/tables");
      const reservationsRes = await fetch("/api/admin/reservations");
      const ordersRes = await fetch("/api/admin/orders");
      const menuRes = await fetch("/api/admin/menu");
      const customersRes = await fetch("/api/admin/customers?limit=50");
      const reviewsRes = await fetch("/api/admin/reviews?limit=50");
      const notificationsRes = await fetch("/api/admin/notifications?limit=50");
      const auditRes = await fetch(`/api/admin/audit?page=${auditPage}&limit=15`);
      const settingsRes = await fetch("/api/settings");

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (tablesRes.ok) {
        const d = await tablesRes.json();
        setTables(d.tables);
      }
      if (reservationsRes.ok) {
        const d = await reservationsRes.json();
        setReservations(d.reservations);
      }
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(d.orders);
      }
      if (menuRes.ok) {
        const d = await menuRes.json();
        setMenuItems(d.items);
        setCategories(d.categories);
        if (d.categories.length > 0 && !menuFormCat) {
          setMenuFormCat(d.categories[0].id);
        }
      }
      if (customersRes.ok) {
        const d = await customersRes.json();
        setCustomers(d.customers);
      }
      if (reviewsRes.ok) {
        const d = await reviewsRes.json();
        setReviews(d.reviews);
        setReviewAnalytics(d.analytics);
      }
      if (notificationsRes.ok) {
        const d = await notificationsRes.json();
        setNotifications(d.notifications);
        setUnreadNotificationsCount(d.unreadCount);
      }
      if (auditRes.ok) {
        const d = await auditRes.json();
        setAuditLogs(d.logs);
        setTotalAuditCount(d.totalCount);
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        setSettings(d);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast("Error loading system metrics.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchData();
    }
  }, [user, auditPage]);

  const handleLogout = async () => {
    await logout();
    toast("Logged out from admin portal.", "success");
    router.push("/admin/login");
  };

  // 1. Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSubmitting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast("Platform configurations updated successfully.", "success");
        fetchData();
      } else {
        toast("Failed to update settings.", "error");
      }
    } catch (e) {
      toast("Settings write failure.", "error");
    } finally {
      setSettingsSubmitting(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // 2. Logo / File upload base64 wrapper
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings((prev) => ({
        ...prev,
        logoImage: reader.result as string,
        logoImageName: file.name,
      }));
      toast(`Logo file "${file.name}" ready to save.`, "info");
    };
    reader.readAsDataURL(file);
  };

  // 3. Table Allocations status updates
  const handleUpdateTableStatus = async (tableId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, status }),
      });
      if (res.ok) {
        toast("Table occupancy status updated.", "success");
        setSelectedTable(null);
        fetchData();
      } else {
        toast("Failed to update table.", "error");
      }
    } catch (e) {
      toast("Error updating table.", "error");
    }
  };

  // 4. Reservation Approvals & Table Conflict warning detection
  const handleReservationAction = async (reservationId: string, action: string, tableId?: string) => {
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId, action, tableId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(data.message || "Reservation updated.", "success");
        fetchData();
      } else {
        toast(data.error || "Failed to update reservation.", "error");
      }
    } catch (e) {
      toast("Connection error.", "error");
    }
  };

  // Conflict Detection Logic (Overlapping slot within 2 hours for same table)
  const getConflictWarning = (res: ReservationType) => {
    if (res.status !== "PENDING" || !res.tableId) return null;
    
    const potentialConflict = reservations.find((other) => {
      if (other.id === res.id || other.tableId !== res.tableId || other.status !== "APPROVED" || other.date !== res.date) {
        return false;
      }
      // Check time overlap (eg slot duration 2 hours)
      const t1 = parseInt(res.time.split(":")[0]) * 60 + parseInt(res.time.split(":")[1]);
      const t2 = parseInt(other.time.split(":")[0]) * 60 + parseInt(other.time.split(":")[1]);
      return Math.abs(t1 - t2) < 120; // 120 minutes conflict duration threshold
    });

    if (potentialConflict) {
      return `Conflict: Table is already allocated to ${potentialConflict.name} at ${potentialConflict.time}`;
    }
    return null;
  };

  // 5. Order status updates
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        toast(`Order status changed to ${status}.`, "success");
        fetchData();
      } else {
        toast("Failed to update order status.", "error");
      }
    } catch (e) {
      toast("Error updating order status.", "error");
    }
  };

  // 6. Review Moderation
  const handleReviewAction = async (reviewId: string, action: string) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action }),
      });
      if (res.ok) {
        toast(`Review status toggled successfully.`, "success");
        fetchData();
      } else {
        toast("Failed to moderate review.", "error");
      }
    } catch (e) {
      toast("Error moderating review.", "error");
    }
  };

  // 7. Notification actions
  const handleNotificationAction = async (notificationId: string, action: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, action }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications?scope=ARCHIVED", {
        method: "DELETE",
      });
      if (res.ok) {
        toast("Archived alert logs successfully cleared.", "success");
        fetchData();
      }
    } catch (e) {
      toast("Failed to clear notifications.", "error");
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "READ_ALL" }),
      });
      if (res.ok) {
        toast("All notifications marked as read.", "success");
        fetchData();
      }
    } catch (e) {
      toast("Error writing notification states.", "error");
    }
  };

  // 8. Menu Item CRUD
  const handleOpenMenuForm = (item?: MenuItemType) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuFormName(item.name);
      setMenuFormTeluguName(item.teluguName || "");
      setMenuFormIsVeg(item.isVeg ?? true);
      setMenuFormDesc(item.description);
      setMenuFormPrice(String(item.price));
      setMenuFormPrep(String(item.prepTime));
      setMenuFormCat(item.categoryId);
      setMenuFormFeatured(item.isFeatured);
      setMenuFormAvailable(item.isAvailable);
      setMenuFormIngs(item.ingredients.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit })));
    } else {
      setEditingMenuItem(null);
      setMenuFormName("");
      setMenuFormTeluguName("");
      setMenuFormIsVeg(true);
      setMenuFormDesc("");
      setMenuFormPrice("");
      setMenuFormPrep("15");
      setMenuFormCat(categories[0]?.id || "");
      setMenuFormFeatured(false);
      setMenuFormAvailable(true);
      setMenuFormIngs([]);
    }
    setMenuFormImage(null);
    setMenuFormImageName(null);
    setShowMenuForm(true);
  };

  const handleAddIngredient = () => {
    if (!newIngName.trim()) return;
    setMenuFormIngs((prev) => [
      ...prev,
      { name: newIngName.trim(), quantity: Number(newIngQty) || 0, unit: newIngUnit },
    ]);
    setNewIngName("");
    setNewIngQty("100");
  };

  const handleRemoveIngredient = (idx: number) => {
    setMenuFormIngs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMenuImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuFormImage(reader.result as string);
      setMenuFormImageName(file.name);
      toast(`Food image "${file.name}" ready to upload.`, "info");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuFormName || !menuFormPrice || !menuFormCat) {
      toast("Please fill in all required fields.", "error");
      return;
    }

    const payload = {
      id: editingMenuItem?.id,
      name: menuFormName,
      teluguName: menuFormTeluguName || undefined,
      isVeg: menuFormIsVeg,
      description: menuFormDesc,
      price: menuFormPrice,
      prepTime: menuFormPrep,
      categoryId: menuFormCat,
      isFeatured: menuFormFeatured,
      isAvailable: menuFormAvailable,
      image: menuFormImage || undefined,
      imageName: menuFormImageName || undefined,
      ingredients: menuFormIngs,
    };

    try {
      const url = "/api/admin/menu";
      const method = editingMenuItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(`Menu item ${editingMenuItem ? "updated" : "created"} successfully.`, "success");
        setShowMenuForm(false);
        fetchData();
      } else {
        const error = await res.json();
        toast(error.error || "Failed to save menu item.", "error");
      }
    } catch (err) {
      toast("Error writing menu item.", "error");
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item? Note: if linked to past orders it will be set unavailable instead of deleted.")) return;
    try {
      const res = await fetch(`/api/admin/menu?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast("Menu item successfully deleted or disabled.", "success");
        fetchData();
      } else {
        toast("Failed to delete item.", "error");
      }
    } catch (e) {
      toast("Connection failure.", "error");
    }
  };

  // Filters computed
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesSearch = 
        cust.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        cust.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
        cust.phone.includes(customerSearch);
      const matchesSpending = cust.totalSpending >= customerMinSpending;
      return matchesSearch && matchesSpending;
    });
  }, [customers, customerSearch, customerMinSpending]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(menuSearch.toLowerCase());
      const matchesCat = menuCatFilter === "ALL" || item.categoryId === menuCatFilter;
      return matchesSearch && matchesCat;
    });
  }, [menuItems, menuSearch, menuCatFilter]);

  // Calendar Occupancy calculations for selected date
  const calendarReservations = useMemo(() => {
    return reservations.filter((r) => r.date === calendarSelectedDate);
  }, [reservations, calendarSelectedDate]);

  const dailyOccupancyRate = useMemo(() => {
    if (tables.length === 0) return 0;
    const reservedTableIds = new Set(
      calendarReservations.filter((r) => r.status === "APPROVED").map((r) => r.tableId)
    );
    return Math.round((reservedTableIds.size / tables.length) * 100);
  }, [tables, calendarReservations]);

  if (checking || (!user && !checking)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-charcoal">
        <p className="animate-pulse tracking-widest text-xs uppercase text-gold font-sans">
          Verifying administrator credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-charcoal   flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Header navbar */}
      <header className="border-b border-gold/15 bg-cream-light/60  backdrop-blur-md sticky top-0 z-30 h-20 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-gold" size={24} />
          <div>
            <h1 className="font-serif text-base uppercase tracking-wider font-bold text-charcoal ">
              PraVaDhya Foods
            </h1>
            <span className="text-[9px] uppercase tracking-[0.25em] text-gold block font-semibold">
              Owner Management Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-charcoal ">{user?.name}</p>
            <p className="text-[9px] uppercase text-gold font-semibold">{user?.role} Portal</p>
          </div>
          
          {/* Notification badge trigger */}
          <button
            onClick={() => setActiveTab("notifications")}
            className="relative p-2 text-charcoal/70  hover:text-gold transition-colors focus:outline-none cursor-pointer"
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-cream-light text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer focus:outline-none"
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Navigation bar */}
        <aside className="w-full lg:w-64 border-r border-gold/10 bg-cream-light/30  p-4 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible scrollbar-none border-b lg:border-b-0">
          {[
            { id: "overview", label: "Dashboard", icon: <BarChart3 size={14} /> },
            { id: "orders", label: "Active Orders", icon: <UtensilsCrossed size={14} /> },
            { id: "reservations", label: "Reservations", icon: <Calendar size={14} /> },
            { id: "menu", label: "Menu Editor", icon: <Plus size={14} /> },
            { id: "customers", label: "Customers", icon: <Users size={14} /> },
            { id: "reviews", label: "Reviews Moderation", icon: <Star size={14} /> },
            { id: "notifications", label: "Alert Logs", icon: <Bell size={14} /> },
            { id: "settings", label: "Settings", icon: <Settings size={14} /> },
            { id: "audit", label: "Audit Logs", icon: <FileText size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-bold transition-all rounded-none whitespace-nowrap lg:w-full cursor-pointer border-b-2 lg:border-b-0 lg:border-l-2 ${
                activeTab === tab.id
                  ? "bg-gold/10 text-gold border-gold"
                  : "border-transparent text-charcoal/60  hover:bg-gold/5 hover:text-gold"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content viewport area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-full">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
              <TableSkeleton />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                
                {/* TAB 1: OVERVIEW & ADVANCED ANALYTICS */}
                {activeTab === "overview" && stats && (
                  <div className="space-y-8">
                    {/* Page Header */}
                    <div>
                      <h2 className="font-serif text-2xl md:text-3xl font-light text-charcoal  uppercase tracking-wide">
                        Enterprise Performance Overview
                      </h2>
                      <p className="text-xs text-charcoal/50  uppercase tracking-wider font-semibold mt-1">
                        Real-time revenue, table utilization, and customer analytics
                      </p>
                    </div>

                    {/* Stat Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-cream-light  p-6 border border-gold/15 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gold tracking-widest block mb-2">Today's Revenue</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-3xl font-bold text-charcoal ">₹{stats.revenue.daily}</span>
                          <span className="text-[10px] text-emerald-500 font-bold font-sans">Delivered</span>
                        </div>
                        <span className="text-[9px] text-charcoal/40  font-sans block mt-3 uppercase tracking-wider">
                          Weekly: ₹{stats.revenue.weekly} | Monthly: ₹{stats.revenue.monthly}
                        </span>
                      </div>

                      <div className="bg-cream-light  p-6 border border-gold/15 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gold tracking-widest block mb-2">Average Order Value</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-3xl font-bold text-charcoal ">₹{stats.averageOrderValue}</span>
                        </div>
                        <span className="text-[9px] text-charcoal/40  font-sans block mt-3 uppercase tracking-wider">
                          Yearly gross: ₹{stats.revenue.yearly}
                        </span>
                      </div>

                      <div className="bg-cream-light  p-6 border border-gold/15 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gold tracking-widest block mb-2">Table Utilization</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-3xl font-bold text-charcoal ">{stats.tableUtilization}%</span>
                        </div>
                        <span className="text-[9px] text-charcoal/40  font-sans block mt-3 uppercase tracking-wider">
                          Capacity Occupancy: {stats.averageTableOccupancy}%
                        </span>
                      </div>

                      <div className="bg-cream-light  p-6 border border-gold/15 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gold tracking-widest block mb-2">Customer Loyalty</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-3xl font-bold text-charcoal ">{stats.customers.total}</span>
                        </div>
                        <span className="text-[9px] text-charcoal/40  font-sans block mt-3 uppercase tracking-wider">
                          Returning: {stats.customers.returning} | New: {stats.customers.new}
                        </span>
                      </div>
                    </div>

                    {/* Advanced SVGs Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Revenue Summary bar chart */}
                      <div className="lg:col-span-8 bg-cream-light  p-6 border border-gold/15 shadow-md flex flex-col justify-between min-h-[360px]">
                        <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-6 text-charcoal  border-b border-gold/10 pb-3">
                          Revenue Summaries (₹ INR)
                        </h3>
                        {/* Responsive SVG Bar Chart */}
                        <div className="w-full h-64 flex items-end">
                          <svg viewBox="0 0 400 200" className="w-full h-full">
                            {/* Grid Lines */}
                            <line x1="40" y1="20" x2="380" y2="20" stroke="#C5A880" strokeOpacity="0.1" strokeDasharray="3" />
                            <line x1="40" y1="70" x2="380" y2="70" stroke="#C5A880" strokeOpacity="0.1" strokeDasharray="3" />
                            <line x1="40" y1="120" x2="380" y2="120" stroke="#C5A880" strokeOpacity="0.1" strokeDasharray="3" />
                            <line x1="40" y1="170" x2="380" y2="170" stroke="#C5A880" strokeOpacity="0.1" />

                            {/* Bars */}
                            {/* Daily */}
                            <rect x="70" y={170 - Math.min(150, (stats.revenue.daily / (stats.revenue.monthly || 1)) * 150)} width="40" height={Math.min(150, (stats.revenue.daily / (stats.revenue.monthly || 1)) * 150)} fill="#C5A880" fillOpacity="0.45" />
                            <text x="90" y="185" fill="#A88F67" fontSize="9" textAnchor="middle" fontWeight="bold">DAILY</text>
                            <text x="90" y={160 - Math.min(150, (stats.revenue.daily / (stats.revenue.monthly || 1)) * 150)} fill="#C5A880" fontSize="9" textAnchor="middle" fontWeight="bold">₹{stats.revenue.daily}</text>

                            {/* Weekly */}
                            <rect x="180" y={170 - Math.min(150, (stats.revenue.weekly / (stats.revenue.monthly || 1)) * 150)} width="40" height={Math.min(150, (stats.revenue.weekly / (stats.revenue.monthly || 1)) * 150)} fill="#C5A880" fillOpacity="0.75" />
                            <text x="200" y="185" fill="#A88F67" fontSize="9" textAnchor="middle" fontWeight="bold">WEEKLY</text>
                            <text x="200" y={160 - Math.min(150, (stats.revenue.weekly / (stats.revenue.monthly || 1)) * 150)} fill="#C5A880" fontSize="9" textAnchor="middle" fontWeight="bold">₹{stats.revenue.weekly}</text>

                            {/* Monthly */}
                            <rect x="290" y={20} width="40" height="150" fill="#C5A880" />
                            <text x="310" y="185" fill="#A88F67" fontSize="9" textAnchor="middle" fontWeight="bold">MONTHLY</text>
                            <text x="310" y="12" fill="#C5A880" fontSize="9" textAnchor="middle" fontWeight="bold">₹{stats.revenue.monthly}</text>
                          </svg>
                        </div>
                      </div>

                      {/* Donut chart for Customer loyalties */}
                      <div className="lg:col-span-4 bg-cream-light  p-6 border border-gold/15 shadow-md flex flex-col justify-between min-h-[360px]">
                        <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-6 text-charcoal  border-b border-gold/10 pb-3">
                          Returning vs New
                        </h3>
                        <div className="w-full flex items-center justify-center h-48 relative">
                          <svg viewBox="0 0 100 100" className="w-40 h-40">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#C5A880" strokeWidth="10" strokeOpacity="0.1" />
                            {/* Returning segment (eg 70%) */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#C5A880" strokeWidth="10" 
                              strokeDasharray={`${stats.customers.total > 0 ? (stats.customers.returning / stats.customers.total) * 251.2 : 125} 251.2`} 
                              transform="rotate(-90 50 50)" 
                            />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-xl font-bold block text-gold">
                              {stats.customers.total > 0 ? Math.round((stats.customers.returning / stats.customers.total) * 100) : 0}%
                            </span>
                            <span className="text-[8px] uppercase tracking-wider text-charcoal/45  font-bold">Returning</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-charcoal/50  pt-4 border-t border-gold/10">
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-gold inline-block" /> Returning ({stats.customers.returning})</span>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-gold/25 inline-block" /> New ({stats.customers.new})</span>
                        </div>
                      </div>
                    </div>

                    {/* Popular vs Least Ordered Dishes Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
                      {/* Top dishes */}
                      <div className="bg-cream-light  p-6 border border-gold/15 shadow-md">
                        <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-4 text-emerald-600  border-b border-gold/10 pb-3 flex items-center gap-2">
                          <TrendingUp size={16} /> Popular Top Selling Dishes
                        </h3>
                        <div className="divide-y divide-gold/10 space-y-4">
                          {stats.popularDishes.map((dish, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 text-xs">
                              <div>
                                <h4 className="font-bold text-charcoal ">{dish.name}</h4>
                                <span className="text-[10px] text-charcoal/40 ">Quantity ordered: {dish.quantity}</span>
                              </div>
                              <span className="font-bold text-gold">₹{dish.revenue}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Least dishes */}
                      <div className="bg-cream-light  p-6 border border-gold/15 shadow-md">
                        <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-4 text-rose-500 border-b border-gold/10 pb-3 flex items-center gap-2">
                          <AlertTriangle size={16} /> Least Ordered Dishes
                        </h3>
                        <div className="divide-y divide-gold/10 space-y-4">
                          {stats.leastOrderedDishes.map((dish, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 text-xs">
                              <div>
                                <h4 className="font-bold text-charcoal ">{dish.name}</h4>
                                <span className="text-[10px] text-charcoal/40 ">Quantity ordered: {dish.quantity}</span>
                              </div>
                              <span className="font-bold text-gold">₹{dish.revenue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ACTIVE ORDERS LIFE LIFE PANEL */}
                {activeTab === "orders" && (
                  <div className="space-y-6 font-sans">
                    <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-light text-charcoal  uppercase tracking-wide">
                          Active Orders Queue
                        </h2>
                        <p className="text-xs text-charcoal/45  uppercase tracking-wider font-semibold mt-1">
                          Manage kitchen preparation pipelines and delivery lifecycles
                        </p>
                      </div>
                    </div>

                    {orders.length === 0 ? (
                      <div className="bg-cream-light  border border-gold/15 p-12 text-center">
                        <p className="text-sm uppercase tracking-widest text-charcoal/40  font-bold">
                          No active orders registered in the system.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-cream-light  border border-gold/15 p-6 shadow-md flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start border-b border-gold/5 pb-3 mb-4">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-gold block">
                                    Order #{order.id.slice(-6).toUpperCase()}
                                  </span>
                                  <span className="text-[9px] text-charcoal/40 ">
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                                <Badge status={order.status} />
                              </div>

                              <div className="space-y-2 mb-6">
                                <p className="text-xs">
                                  <strong>Customer:</strong> {order.customer.name} ({order.customer.phone})
                                </p>
                                <div className="pl-3 border-l border-gold/15 space-y-1 text-xs text-charcoal/80 ">
                                  {order.items.map((i) => (
                                    <p key={i.id}>
                                      {i.menuItem.name} <span className="font-bold text-gold">×{i.quantity}</span> (₹{i.price})
                                    </p>
                                  ))}
                                </div>
                                {order.notes && (
                                  <p className="text-[11px] italic text-charcoal/60  mt-2">
                                    Notes: "{order.notes}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gold/5 mt-4">
                              <span className="text-sm font-bold text-gold">₹{order.totalAmount}</span>
                              <div className="flex gap-2">
                                {order.status === "PENDING" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "CONFIRMED")}
                                    className="bg-gold text-charcoal text-[9px] uppercase tracking-wider font-bold px-3 py-2 hover:bg-gold-dark cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                )}
                                {order.status === "CONFIRMED" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                                    className="bg-amber-500 text-charcoal text-[9px] uppercase tracking-wider font-bold px-3 py-2 hover:bg-amber-600 cursor-pointer"
                                  >
                                    Prepare
                                  </button>
                                )}
                                {order.status === "PREPARING" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "READY")}
                                    className="bg-blue-500 text-white text-[9px] uppercase tracking-wider font-bold px-3 py-2 hover:bg-blue-600 cursor-pointer"
                                  >
                                    Ready
                                  </button>
                                )}
                                {order.status === "READY" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "OUT_FOR_DELIVERY")}
                                    className="bg-purple-600 text-white text-[9px] uppercase tracking-wider font-bold px-3 py-2 hover:bg-purple-700 cursor-pointer"
                                  >
                                    Dispatch
                                  </button>
                                )}
                                {order.status === "OUT_FOR_DELIVERY" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "DELIVERED")}
                                    className="bg-emerald-600 text-white text-[9px] uppercase tracking-wider font-bold px-3 py-2 hover:bg-emerald-700 cursor-pointer"
                                  >
                                    Deliver
                                  </button>
                                )}
                                {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                                    className="border border-rose-500/30 text-rose-500 text-[9px] uppercase tracking-wider font-bold px-3 py-2 hover:bg-rose-500/10 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: RESERVATIONS & VISUAL CALENDAR VIEW */}
                {activeTab === "reservations" && (
                  <div className="space-y-8 font-sans">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gold/10 pb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-light text-charcoal  uppercase tracking-wide">
                          Reservation Calendar & Allocation
                        </h2>
                        <p className="text-xs text-charcoal/45  uppercase tracking-wider font-semibold mt-1">
                          Approve bookings, allocate visual tables, and check conflicts
                        </p>
                      </div>
                      
                      {/* Date picker calendar trigger */}
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] uppercase font-bold text-gold">Target Date:</label>
                        <input
                          type="date"
                          value={calendarSelectedDate}
                          onChange={(e) => setCalendarSelectedDate(e.target.value)}
                          className="bg-cream-light  border border-gold/25 text-xs text-charcoal  p-2 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Daily occupancy ratios & slots stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-cream-light  p-6 border border-gold/15 shadow-sm text-center">
                        <span className="text-[9px] uppercase font-bold text-gold tracking-widest block mb-1">Occupancy percentage</span>
                        <span className="font-serif text-3xl font-bold text-charcoal ">{dailyOccupancyRate}%</span>
                        <div className="w-full bg-gold/10 h-1.5 mt-3">
                          <div className="bg-gold h-1.5" style={{ width: `${dailyOccupancyRate}%` }} />
                        </div>
                      </div>
                      <div className="bg-cream-light  p-6 border border-gold/15 shadow-sm text-center">
                        <span className="text-[9px] uppercase font-bold text-gold tracking-widest block mb-1">Active Bookings</span>
                        <span className="font-serif text-3xl font-bold text-charcoal ">
                          {calendarReservations.filter((r) => r.status === "APPROVED").length} Approved
                        </span>
                        <span className="text-[9px] text-charcoal/40  block mt-2">
                          Pending Approval: {calendarReservations.filter((r) => r.status === "PENDING").length}
                        </span>
                      </div>
                      <div className="bg-cream-light  p-6 border border-gold/15 shadow-sm text-center flex flex-col justify-center">
                        <span className="text-[9px] uppercase font-bold text-gold tracking-widest block mb-1">Peak Hours Slot</span>
                        <span className="font-serif text-lg font-bold text-gold">7:00 PM - 9:00 PM</span>
                      </div>
                    </div>

                    {/* Daily Reservation Lists with Conflict Indicators */}
                    <div className="bg-cream-light  p-6 border border-gold/15 shadow-md">
                      <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-6 text-charcoal  border-b border-gold/10 pb-3">
                        Daily Bookings list ({calendarSelectedDate})
                      </h3>
                      
                      {calendarReservations.length === 0 ? (
                        <p className="text-xs uppercase tracking-widest text-charcoal/40  font-bold py-8 text-center">
                          No reservations registered for this date.
                        </p>
                      ) : (
                        <div className="divide-y divide-gold/10 space-y-4">
                          {calendarReservations.map((res) => {
                            const conflict = getConflictWarning(res);
                            return (
                              <div key={res.id} className="pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-charcoal  text-sm">{res.name}</h4>
                                    <span className="text-[9px] bg-gold/15 text-gold px-1.5 py-0.5 font-bold uppercase">{res.time}</span>
                                    <Badge status={res.status} />
                                  </div>
                                  <p className="text-charcoal/60  mt-1">
                                    Guests: {res.guests} | Phone: {res.phone} | Email: {res.email}
                                  </p>
                                  {res.notes && <p className="italic text-charcoal/45  mt-1">"Notes: {res.notes}"</p>}
                                  {conflict && (
                                    <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 block mt-2 w-fit">
                                      {conflict}
                                    </span>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  {res.status === "PENDING" && (
                                    <>
                                      {/* Dropdown to assign a table */}
                                      <select
                                        onChange={(e) => handleReservationAction(res.id, "ASSIGN_TABLE", e.target.value)}
                                        defaultValue=""
                                        className="bg-cream  border border-gold/25 text-[10px] text-charcoal  p-1.5 focus:outline-none"
                                      >
                                        <option value="" disabled>Assign Table</option>
                                        {tables.filter((t) => t.status === "AVAILABLE" && t.capacity >= res.guests).map((t) => (
                                          <option key={t.id} value={t.id}>Table #{t.number} (Cap: {t.capacity})</option>
                                        ))}
                                      </select>
                                      
                                      <button
                                        onClick={() => handleReservationAction(res.id, "REJECT")}
                                        className="border border-rose-500/30 text-rose-500 text-[9px] uppercase tracking-wider font-bold px-2 py-1.5 hover:bg-rose-500/10 cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {res.status === "APPROVED" && res.table && (
                                    <span className="text-[10px] font-bold text-gold bg-gold/10 px-3 py-1.5 border border-gold/20">
                                      Allocated: Table #{res.table.number}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: MENU MANAGEMENT CRUD */}
                {activeTab === "menu" && (
                  <div className="space-y-6 font-sans">
                    <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-light text-charcoal  uppercase tracking-wide">
                          Menu Catalog Management
                        </h2>
                        <p className="text-xs text-charcoal/45  uppercase tracking-wider font-semibold mt-1">
                          Configure food items, ingredients inventories, and availability
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenMenuForm()}
                        className="bg-gold text-charcoal text-xs uppercase tracking-wider font-bold px-4 py-3 hover:bg-gold-dark transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Plus size={14} /> Add Menu Item
                      </button>
                    </div>

                    {/* Categories dropdown filter */}
                    <div className="flex items-center gap-4 bg-cream-light  p-4 border border-gold/15">
                      <span className="text-xs font-bold text-gold uppercase">Filter Category:</span>
                      <select
                        value={menuCatFilter}
                        onChange={(e) => setMenuCatFilter(e.target.value)}
                        className="bg-cream  border border-gold/25 text-xs text-charcoal  p-2 focus:outline-none"
                      >
                        <option value="ALL">All Categories</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        placeholder="Search menu..."
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        className="bg-cream  border border-gold/25 text-xs text-charcoal  p-2 focus:outline-none ml-auto"
                      />
                    </div>

                    {/* Menu CRUD Modal Form */}
                    {showMenuForm && (
                      <form onSubmit={handleSaveMenuItem} className="bg-cream-light  p-6 border border-gold shadow-lg space-y-6">
                        <h3 className="font-serif text-lg font-medium border-b border-gold/10 pb-3 text-charcoal  uppercase">
                          {editingMenuItem ? "Edit Menu Item" : "Create Menu Item"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-gold">Item Name *</label>
                            <input
                              type="text"
                              value={menuFormName}
                              onChange={(e) => setMenuFormName(e.target.value)}
                              className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none focus:border-gold"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-gold">Telugu Name</label>
                            <input
                              type="text"
                              value={menuFormTeluguName}
                              onChange={(e) => setMenuFormTeluguName(e.target.value)}
                              className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none focus:border-gold"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-gold">Price (₹ INR) *</label>
                            <input
                              type="number"
                              value={menuFormPrice}
                              onChange={(e) => setMenuFormPrice(e.target.value)}
                              className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none focus:border-gold"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-gold">Preparation Time (mins) *</label>
                            <input
                              type="number"
                              value={menuFormPrep}
                              onChange={(e) => setMenuFormPrep(e.target.value)}
                              className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none focus:border-gold"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-gold">Category *</label>
                            <select
                              value={menuFormCat}
                              onChange={(e) => setMenuFormCat(e.target.value)}
                              className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              required
                            >
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-gold">Dietary Preference *</label>
                            <select
                              value={menuFormIsVeg ? "veg" : "nonveg"}
                              onChange={(e) => setMenuFormIsVeg(e.target.value === "veg")}
                              className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              required
                            >
                              <option value="veg">Vegetarian</option>
                              <option value="nonveg">Non-Vegetarian</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-gold">Upload Food Image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleMenuImageChange}
                              className="text-xs text-charcoal "
                            />
                          </div>

                          <div className="flex items-center gap-6 pt-6">
                            <label className="flex items-center gap-2 text-xs font-bold text-charcoal  cursor-pointer">
                              <input
                                type="checkbox"
                                checked={menuFormFeatured}
                                onChange={(e) => setMenuFormFeatured(e.target.checked)}
                              />
                              Featured Item
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold text-charcoal  cursor-pointer">
                              <input
                                type="checkbox"
                                checked={menuFormAvailable}
                                onChange={(e) => setMenuFormAvailable(e.target.checked)}
                              />
                              Available In Stock
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase font-bold text-gold">Description *</label>
                          <textarea
                            value={menuFormDesc}
                            onChange={(e) => setMenuFormDesc(e.target.value)}
                            className="bg-cream  border border-gold/25 p-3 text-xs text-charcoal  focus:outline-none h-20 resize-none"
                            required
                          />
                        </div>

                        {/* Ingredients Sub-form (Inventory Preparation Layer) */}
                        <div className="border border-gold/15 p-4 space-y-4 bg-cream ">
                          <h4 className="text-xs font-bold text-gold uppercase tracking-wider">
                            Ingredient List (Inventory Prep Layer)
                          </h4>
                          
                          <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] uppercase font-semibold text-charcoal/65 ">Ingredient Name</label>
                              <input
                                type="text"
                                value={newIngName}
                                onChange={(e) => setNewIngName(e.target.value)}
                                className="bg-cream-light  border border-gold/20 p-2 text-xs text-charcoal "
                              />
                            </div>
                            <div className="flex flex-col gap-1 w-20">
                              <label className="text-[9px] uppercase font-semibold text-charcoal/65 ">Quantity</label>
                              <input
                                type="number"
                                value={newIngQty}
                                onChange={(e) => setNewIngQty(e.target.value)}
                                className="bg-cream-light  border border-gold/20 p-2 text-xs text-charcoal "
                              />
                            </div>
                            <div className="flex flex-col gap-1 w-24">
                              <label className="text-[9px] uppercase font-semibold text-charcoal/65 ">Unit</label>
                              <input
                                type="text"
                                value={newIngUnit}
                                onChange={(e) => setNewIngUnit(e.target.value)}
                                className="bg-cream-light  border border-gold/20 p-2 text-xs text-charcoal "
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleAddIngredient}
                              className="bg-gold text-charcoal px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Add
                            </button>
                          </div>

                          {menuFormIngs.length > 0 && (
                            <div className="flex flex-wrap gap-3 pt-2">
                              {menuFormIngs.map((ing, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-2 bg-gold/15 text-gold border border-gold/20 px-2.5 py-1 text-xs font-medium"
                                >
                                  {ing.name} ({ing.quantity} {ing.unit})
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveIngredient(idx)}
                                    className="text-rose-500 hover:text-rose-600 focus:outline-none"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t border-gold/10">
                          <button
                            type="button"
                            onClick={() => setShowMenuForm(false)}
                            className="px-4 py-2 text-xs uppercase tracking-wider text-charcoal/45  hover:underline"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-gold text-charcoal px-6 py-2.5 text-xs uppercase tracking-wider font-bold hover:bg-gold-dark cursor-pointer"
                          >
                            {editingMenuItem ? "Save Changes" : "Create Item"}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Catalog list grid */}
                    <div className="bg-cream-light  border border-gold/15 shadow-md overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gold/15 text-gold uppercase tracking-wider text-[10px]">
                            <th className="p-4">Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Prep Time</th>
                            <th className="p-4">Featured</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold/5 font-medium">
                          {filteredMenuItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gold/5 transition-colors">
                              <td className="p-4 font-bold text-charcoal ">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} title={item.isVeg ? "Veg" : "Non-Veg"} />
                                  <div>
                                    <div>{item.name}</div>
                                    {item.teluguName && <span className="text-[10px] text-charcoal/50  font-normal font-sans">{item.teluguName}</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-charcoal/70 ">{item.category.name}</td>
                              <td className="p-4 text-gold">₹{item.price}</td>
                              <td className="p-4">{item.prepTime} mins</td>
                              <td className="p-4">
                                {item.isFeatured ? (
                                  <span className="text-[10px] font-bold text-gold bg-gold/15 px-2 py-0.5">FEATURED</span>
                                ) : (
                                  <span className="text-[10px] text-charcoal/30">No</span>
                                )}
                              </td>
                              <td className="p-4">
                                {item.isAvailable ? (
                                  <span className="text-[10px] font-bold text-emerald-500">AVAILABLE</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-rose-500">OUT OF STOCK</span>
                                )}
                              </td>
                              <td className="p-4 text-right flex gap-3 justify-end">
                                <button
                                  onClick={() => handleOpenMenuForm(item)}
                                  className="text-gold hover:text-gold-dark cursor-pointer p-1"
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMenuItem(item.id)}
                                  className="text-charcoal/30 hover:text-rose-500 cursor-pointer p-1"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 5: CUSTOMER HISTORIES & SEARCH */}
                {activeTab === "customers" && (
                  <div className="space-y-6 font-sans">
                    <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-light text-charcoal  uppercase tracking-wide">
                          Customer Directories & History
                        </h2>
                        <p className="text-xs text-charcoal/45  uppercase tracking-wider font-semibold mt-1">
                          Search guest profiles, spending values, and order trails
                        </p>
                      </div>
                    </div>

                    {/* Search row */}
                    <div className="flex flex-wrap gap-4 items-center bg-cream-light  p-4 border border-gold/15">
                      <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="bg-cream  border border-gold/25 text-xs text-charcoal  p-2 focus:outline-none w-72"
                      />
                      
                      <div className="flex items-center gap-3 ml-auto">
                        <label className="text-[10px] uppercase font-bold text-gold">Min Spending (₹):</label>
                        <input
                          type="number"
                          value={customerMinSpending}
                          onChange={(e) => setCustomerMinSpending(Number(e.target.value))}
                          className="bg-cream  border border-gold/25 text-xs text-charcoal  p-2 focus:outline-none w-28"
                        />
                      </div>
                    </div>

                    {/* Customer log table */}
                    <div className="bg-cream-light  border border-gold/15 shadow-md overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gold/15 text-gold uppercase tracking-wider text-[10px]">
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">Orders Placed</th>
                            <th className="p-4">Total Spending</th>
                            <th className="p-4">Bookings Count</th>
                            <th className="p-4 text-right">History</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold/5 font-medium">
                          {filteredCustomers.map((cust) => (
                            <tr key={cust.id} className="hover:bg-gold/5 transition-colors">
                              <td className="p-4 font-bold text-charcoal ">{cust.name}</td>
                              <td className="p-4 text-charcoal/70 ">{cust.email}</td>
                              <td className="p-4">{cust.phone}</td>
                              <td className="p-4">{cust.totalOrders}</td>
                              <td className="p-4 text-gold">₹{cust.totalSpending}</td>
                              <td className="p-4">{cust.reservationCount}</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => setSelectedCustomer(cust)}
                                  className="text-xs uppercase font-bold text-gold hover:underline cursor-pointer"
                                >
                                  View History
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 6: REVIEW MODERATION & RATINGS */}
                {activeTab === "reviews" && (
                  <div className="space-y-8 font-sans">
                    <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-light text-charcoal  uppercase tracking-wide">
                          Reviews & Ratings Moderation
                        </h2>
                        <p className="text-xs text-charcoal/45  uppercase tracking-wider font-semibold mt-1">
                          Approve, Hide, and Feature customer reviews and ratings
                        </p>
                      </div>
                    </div>

                    {/* Ratings aggregate metrics */}
                    {reviewAnalytics && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-cream-light  p-6 border border-gold/15 shadow-sm text-center">
                          <span className="text-[9px] uppercase font-bold text-gold tracking-widest block mb-1">Average rating</span>
                          <span className="font-serif text-4xl font-bold text-gold">{reviewAnalytics.averageRating} / 5</span>
                          <div className="flex justify-center gap-1 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.round(reviewAnalytics.averageRating) ? "fill-gold text-gold" : "text-gold/20"}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-cream-light  p-6 border border-gold/15 shadow-sm md:col-span-2">
                          <span className="text-[9px] uppercase font-bold text-gold tracking-widest block mb-3">Star Distribution</span>
                          <div className="space-y-2 text-xs">
                            {[5, 4, 3, 2, 1].map((stars) => {
                              const count = reviewAnalytics.starDistribution[stars] || 0;
                              const percentage = reviewAnalytics.totalReviewsCount > 0 
                                ? Math.round((count / reviewAnalytics.totalReviewsCount) * 100) 
                                : 0;
                              return (
                                <div key={stars} className="flex items-center gap-3">
                                  <span className="w-10 font-bold">{stars} Stars</span>
                                  <div className="flex-1 bg-gold/10 h-2">
                                    <div className="bg-gold h-2" style={{ width: `${percentage}%` }} />
                                  </div>
                                  <span className="w-12 text-right text-charcoal/50 ">{count} ({percentage}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reviews list */}
                    <div className="bg-cream-light  p-6 border border-gold/15 shadow-md">
                      <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-6 text-charcoal  border-b border-gold/10 pb-3">
                        Customer Submissions List ({reviews.length})
                      </h3>
                      
                      {reviews.length === 0 ? (
                        <p className="text-xs uppercase tracking-widest text-charcoal/40  font-bold py-8 text-center">
                          No customer reviews logged in database.
                        </p>
                      ) : (
                        <div className="divide-y divide-gold/10 space-y-6">
                          {reviews.map((rev) => (
                            <div key={rev.id} className="pt-6 flex flex-col md:flex-row justify-between items-start gap-4 text-xs">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-bold text-charcoal  text-sm">{rev.name}</h4>
                                  <span className="text-charcoal/40 ">({rev.email})</span>
                                  <Badge status={rev.status} />
                                  {rev.isFeatured && (
                                    <span className="text-[9px] bg-gold/15 text-gold px-1.5 py-0.5 font-bold uppercase tracking-wider border border-gold/20">
                                      FEATURED ON HOME
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      className={i < rev.rating ? "fill-gold text-gold" : "text-gold/20"}
                                    />
                                  ))}
                                </div>

                                <p className="italic text-charcoal-light/90  leading-relaxed text-sm">
                                  "{rev.comment}"
                                </p>
                              </div>

                              <div className="flex gap-2 self-center">
                                {rev.status !== "APPROVED" && (
                                  <button
                                    onClick={() => handleReviewAction(rev.id, "APPROVE")}
                                    className="bg-gold text-charcoal text-[9px] uppercase tracking-wider font-bold px-3 py-2 hover:bg-gold-dark cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                {rev.status !== "HIDDEN" && (
                                  <button
                                    onClick={() => handleReviewAction(rev.id, "HIDE")}
                                    className="border border-rose-500/30 text-rose-500 text-[9px] uppercase tracking-wider font-bold px-3 py-2 hover:bg-rose-500/10 cursor-pointer"
                                  >
                                    Hide
                                  </button>
                                )}
                                <button
                                  onClick={() => handleReviewAction(rev.id, "FEATURE")}
                                  className="border border-gold text-gold text-[9px] uppercase tracking-wider font-bold px-3 py-2 hover:bg-gold hover:text-charcoal cursor-pointer"
                                >
                                  {rev.isFeatured ? "Un-feature" : "Feature"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 7: NOTIFICATIONS CENTER */}
                {activeTab === "notifications" && (
                  <div className="space-y-6 font-sans">
                    <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-light text-charcoal  uppercase tracking-wide">
                          Notification Center & Alerts
                        </h2>
                        <p className="text-xs text-charcoal/45  uppercase tracking-wider font-semibold mt-1">
                          Review prioritized system logs, orders, and table bookings
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleMarkAllNotificationsRead}
                          className="border border-gold text-gold text-[10px] uppercase font-bold tracking-wider px-3.5 py-2.5 hover:bg-gold hover:text-charcoal cursor-pointer focus:outline-none"
                        >
                          Mark All Read
                        </button>
                        <button
                          onClick={handleClearAllNotifications}
                          className="border border-rose-500/30 text-rose-500 text-[10px] uppercase font-bold tracking-wider px-3.5 py-2.5 hover:bg-rose-500/10 cursor-pointer focus:outline-none"
                        >
                          Clear Archived Logs
                        </button>
                      </div>
                    </div>

                    {/* Alerts lists */}
                    <div className="bg-cream-light  p-6 border border-gold/15 shadow-md">
                      {notifications.length === 0 ? (
                        <p className="text-xs uppercase tracking-widest text-charcoal/40  font-bold py-10 text-center">
                          No notifications logs registered.
                        </p>
                      ) : (
                        <div className="divide-y divide-gold/10 space-y-4">
                          {notifications.map((n) => (
                            <div key={n.id} className="pt-4 flex justify-between items-center gap-4 text-xs">
                              <div className="flex items-start gap-3">
                                {n.priority === "CRITICAL" ? (
                                  <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                                ) : n.priority === "WARNING" ? (
                                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p className={`text-charcoal  ${n.status === "UNREAD" ? "font-bold" : "font-light"}`}>
                                    {n.message}
                                  </p>
                                  <span className="text-[9px] text-charcoal/40  font-sans block mt-1">
                                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {n.status === "UNREAD" && (
                                  <button
                                    onClick={() => handleNotificationAction(n.id, "READ")}
                                    className="text-[9px] uppercase font-bold text-gold hover:underline cursor-pointer"
                                  >
                                    Mark Read
                                  </button>
                                )}
                                {n.status !== "ARCHIVED" && (
                                  <button
                                    onClick={() => handleNotificationAction(n.id, "ARCHIVED")}
                                    className="text-[9px] uppercase font-bold text-charcoal/40 hover:underline cursor-pointer"
                                  >
                                    Archive
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 8: RESTAURANT CONFIGURATION MODULE */}
                {activeTab === "settings" && (
                  <div className="space-y-6 font-sans">
                    <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-light text-charcoal  uppercase tracking-wide">
                          Platform Configuration Settings
                        </h2>
                        <p className="text-xs text-charcoal/45  uppercase tracking-wider font-semibold mt-1">
                          Manage taxes, delivery charges, operating hours, and corporate branding
                        </p>
                      </div>
                    </div>

                    {/* Section Selector Tab */}
                    <div className="flex gap-3 border-b border-gold/10 pb-2 overflow-x-auto scrollbar-none">
                      {[
                        { id: "general", label: "General Info" },
                        { id: "ordering", label: "Order Rules" },
                        { id: "reservations", label: "Bookings Rules" },
                        { id: "branding", label: "Branding Styles" },
                      ].map((sec) => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setActiveSettingsSection(sec.id as any)}
                          className={`text-xs uppercase tracking-wider font-bold px-3 py-1 cursor-pointer transition-colors ${
                            activeSettingsSection === sec.id ? "text-gold underline underline-offset-4" : "text-charcoal/40  hover:text-gold"
                          }`}
                        >
                          {sec.label}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSaveSettings} className="bg-cream-light  p-6 border border-gold/15 shadow-md space-y-6">
                      
                      {activeSettingsSection === "general" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">Restaurant Name</label>
                              <input
                                type="text"
                                value={settings.restaurant_name || ""}
                                onChange={(e) => handleSettingChange("restaurant_name", e.target.value)}
                                className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">Contact Phone Number</label>
                              <input
                                type="text"
                                value={settings.contact_number || ""}
                                onChange={(e) => handleSettingChange("contact_number", e.target.value)}
                                className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">WhatsApp Number</label>
                              <input
                                type="text"
                                value={settings.whatsapp_number || ""}
                                onChange={(e) => handleSettingChange("whatsapp_number", e.target.value)}
                                className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">Operating Hours</label>
                              <input
                                type="text"
                                value={settings.business_hours || ""}
                                onChange={(e) => handleSettingChange("business_hours", e.target.value)}
                                className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-gold">Restaurant Location Address</label>
                            <textarea
                              value={settings.address || ""}
                              onChange={(e) => handleSettingChange("address", e.target.value)}
                              className="bg-cream  border border-gold/25 p-3 text-xs text-charcoal  focus:outline-none h-16 resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {activeSettingsSection === "ordering" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">GST Percentage (%)</label>
                              <input
                                type="number"
                                value={settings.gst_percentage || "0"}
                                onChange={(e) => handleSettingChange("gst_percentage", e.target.value)}
                                className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">Flat Delivery Charges (₹)</label>
                              <input
                                type="number"
                                value={settings.delivery_fee || "0"}
                                onChange={(e) => handleSettingChange("delivery_fee", e.target.value)}
                                className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">Minimum Order Amount (₹)</label>
                              <input
                                type="number"
                                value={settings.order_min_amount || "100"}
                                onChange={(e) => handleSettingChange("order_min_amount", e.target.value)}
                                className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSettingsSection === "reservations" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">Max Party Size (Guests)</label>
                              <input
                                type="number"
                                value={settings.reservation_max_guests || "12"}
                                onChange={(e) => handleSettingChange("reservation_max_guests", e.target.value)}
                                className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">Slot Duration (Minutes)</label>
                              <input
                                type="number"
                                value={settings.reservation_slot_duration || "120"}
                                onChange={(e) => handleSettingChange("reservation_slot_duration", e.target.value)}
                                className="bg-cream  border border-gold/25 p-2.5 text-xs text-charcoal  focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSettingsSection === "branding" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">Primary Gold Accents Color</label>
                              <input
                                type="color"
                                value={settings.branding_primary_color || "#C5A880"}
                                onChange={(e) => handleSettingChange("branding_primary_color", e.target.value)}
                                className="h-10 w-full bg-cream  border border-gold/25 p-1 cursor-pointer"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">Dark Theme Background</label>
                              <input
                                type="color"
                                value={settings.branding_dark_theme_bg || "#121212"}
                                onChange={(e) => handleSettingChange("branding_dark_theme_bg", e.target.value)}
                                className="h-10 w-full bg-cream  border border-gold/25 p-1 cursor-pointer"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gold">Corporate Logo File</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="text-xs pt-1.5"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-4 border-t border-gold/10">
                        <LuxuryButton
                          type="submit"
                          disabled={settingsSubmitting}
                          className="px-6 py-2.5 text-center"
                        >
                          {settingsSubmitting ? "Saving Configuration..." : "Save Settings"}
                        </LuxuryButton>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 9: AUDIT LOG SYSTEM EVENTS */}
                {activeTab === "audit" && (
                  <div className="space-y-6 font-sans">
                    <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-light text-charcoal  uppercase tracking-wide">
                          Database Audit Activity logs
                        </h2>
                        <p className="text-xs text-charcoal/45  uppercase tracking-wider font-semibold mt-1">
                          Track logins, menu modifications, settings updates, and status updates
                        </p>
                      </div>
                    </div>

                    {/* Audit list logs */}
                    <div className="bg-cream-light  border border-gold/15 shadow-md overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gold/15 text-gold uppercase tracking-wider text-[10px]">
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Administrator details</th>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Summary Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold/5 font-medium">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gold/5 transition-colors">
                              <td className="p-4 text-charcoal/40  whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString()}
                              </td>
                              <td className="p-4 font-bold text-gold uppercase tracking-wider text-[10px]">{log.action}</td>
                              <td className="p-4 text-charcoal ">
                                {log.user ? `${log.user.name} (${log.role})` : "System / Wizard"}
                              </td>
                              <td className="p-4">{log.ipAddress || "127.0.0.1"}</td>
                              <td className="p-4 text-charcoal/70  font-light leading-relaxed max-w-sm">
                                {log.details}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalAuditCount > 15 && (
                      <div className="flex justify-end items-center gap-4 text-xs font-bold pt-4">
                        <button
                          disabled={auditPage === 1}
                          onClick={() => setAuditPage((prev) => prev - 1)}
                          className="flex items-center gap-1.5 hover:text-gold cursor-pointer disabled:opacity-30"
                        >
                          <ChevronLeft size={14} /> Prev
                        </button>
                        <span className="text-gold">Page {auditPage} of {Math.ceil(totalAuditCount / 15)}</span>
                        <button
                          disabled={auditPage >= Math.ceil(totalAuditCount / 15)}
                          onClick={() => setAuditPage((prev) => prev + 1)}
                          className="flex items-center gap-1.5 hover:text-gold cursor-pointer disabled:opacity-30"
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* SELECTED CUSTOMER MODAL VIEW */}
      <AnimatePresence>
        {selectedCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-6 bottom-6 md:inset-x-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto w-full max-w-2xl bg-cream border border-gold/25 p-6 z-50 shadow-2xl font-sans text-charcoal text-xs overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start border-b border-gold/15 pb-3 mb-6">
                <div>
                  <h3 className="font-serif text-lg font-medium text-charcoal uppercase tracking-wide">
                    {selectedCustomer.name} Histories
                  </h3>
                  <p className="text-[10px] text-charcoal/45 uppercase tracking-wider font-semibold">
                    Email: {selectedCustomer.email} | Phone: {selectedCustomer.phone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 hover:text-rose-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Order history sub-section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gold/15 p-4 bg-cream-light h-96 overflow-y-auto pr-2">
                  <h4 className="font-serif text-xs font-bold text-gold uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-gold/10 pb-2">
                    <UtensilsCrossed size={14} /> Orders list ({selectedCustomer.orders.length})
                  </h4>
                  {selectedCustomer.orders.length === 0 ? (
                    <p className="text-[10px] text-charcoal/40 uppercase tracking-widest text-center py-10 font-bold">No orders placed.</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedCustomer.orders.map((order) => (
                        <div key={order.id} className="border-b border-gold/5 pb-3 last:border-0">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>#{order.id.slice(-6).toUpperCase()}</span>
                            <span className="text-gold">₹{order.totalAmount}</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-charcoal/45 mt-1">
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>{order.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Table Reservations history sub-section */}
                <div className="border border-gold/15 p-4 bg-cream-light h-96 overflow-y-auto pr-2">
                  <h4 className="font-serif text-xs font-bold text-gold uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-gold/10 pb-2">
                    <Calendar size={14} /> Reservations ({selectedCustomer.reservations.length})
                  </h4>
                  {selectedCustomer.reservations.length === 0 ? (
                    <p className="text-[10px] text-charcoal/40 uppercase tracking-widest text-center py-10 font-bold">No bookings recorded.</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedCustomer.reservations.map((res) => (
                        <div key={res.id} className="border-b border-gold/5 pb-3 last:border-0">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>{res.date} at {res.time}</span>
                            <span>{res.guests} Pax</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-charcoal/45 mt-1">
                            <span>Status: {res.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

