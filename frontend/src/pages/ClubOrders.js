import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package, Settings, FlaskConical, Star, PackageCheck,
  Truck, CheckCircle2, Clock, ChevronDown, ChevronUp
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ORDER_STATUSES = [
  { key: "received",   label: "Pedido Recibido",     icon: Package,      color: "text-zinc-400",  bg: "bg-zinc-500/20",   glow: "rgba(161,161,170,0.3)"  },
  { key: "preparing",  label: "En Preparación",       icon: Settings,     color: "text-blue-400",  bg: "bg-blue-500/20",   glow: "rgba(96,165,250,0.3)"   },
  { key: "production", label: "En Producción",        icon: FlaskConical, color: "text-purple-400",bg: "bg-purple-500/20", glow: "rgba(192,132,252,0.3)"  },
  { key: "quality",    label: "Control de Calidad",   icon: Star,         color: "text-yellow-400",bg: "bg-yellow-500/20", glow: "rgba(250,204,21,0.3)"   },
  { key: "ready",      label: "Listo para Envío",     icon: PackageCheck, color: "text-cyan-400",  bg: "bg-cyan-500/20",   glow: "rgba(34,211,238,0.3)"   },
  { key: "shipped",    label: "Enviado",              icon: Truck,        color: "text-orange-400",bg: "bg-orange-500/20", glow: "rgba(251,146,60,0.3)"   },
  { key: "delivered",  label: "Entregado",            icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/20",  glow: "rgba(74,222,128,0.3)"   },
];

const getStatus = (key) => ORDER_STATUSES.find(s => s.key === key) || ORDER_STATUSES[0];
const statusIndex = (key) => ORDER_STATUSES.findIndex(s => s.key === key);

const ClubOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState({});

  const fetchOrders = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/orders/${user.club_id}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const toggleHistory = (id) =>
    setExpandedHistory(prev => ({ ...prev, [id]: !prev[id] }));

  const activeOrders  = orders.filter(o => o.status !== "delivered");
  const pastOrders    = orders.filter(o => o.status === "delivered");

  return (
    <ClubLayout title="Mis Pedidos">
      {loading ? (
        <div className="text-center py-20 text-zinc-400">Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <Card className="bg-[#121212] border-white/10 p-12 text-center">
          <Package className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No tienes pedidos en curso</p>
          <p className="text-zinc-600 text-sm mt-2">
            Cuando realices un pedido con ADIVINA, podrás seguir su estado aquí
          </p>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* Pedidos activos */}
          {activeOrders.length > 0 && (
            <section>
              <h2 className="text-lg font-bold uppercase tracking-wide text-zinc-300 mb-4">
                En Curso ({activeOrders.length})
              </h2>
              <div className="space-y-6">
                {activeOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    expanded={expandedHistory[order.id]}
                    onToggle={() => toggleHistory(order.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Pedidos entregados */}
          {pastOrders.length > 0 && (
            <section>
              <h2 className="text-lg font-bold uppercase tracking-wide text-zinc-300 mb-4">
                Entregados ({pastOrders.length})
              </h2>
              <div className="space-y-4">
                {pastOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    expanded={expandedHistory[order.id]}
                    onToggle={() => toggleHistory(order.id)}
                    compact
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </ClubLayout>
  );
};

/* ─── OrderCard ─────────────────────────────────────────────── */
const OrderCard = ({ order, expanded, onToggle, compact = false }) => {
  const cfg = getStatus(order.status);
  const currentIdx = statusIndex(order.status);
  const isDelivered = order.status === "delivered";

  return (
    <Card className={`bg-[#121212] border overflow-hidden transition-all duration-300 ${
      isDelivered ? "border-green-500/20" : "border-white/10 hover:border-[#DFFF00]/20"
    }`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-xl">{order.description}</CardTitle>
              <StatusBadgeFull status={order.status} />
            </div>
            <p className="text-xs text-zinc-500">
              Pedido registrado el{" "}
              {new Date(order.created_at).toLocaleDateString("es-ES", {
                day: "2-digit", month: "long", year: "numeric"
              })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Artículos */}
        {order.items?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {order.items.map((item, i) => (
              <span key={i} className="text-xs bg-white/5 text-zinc-300 px-3 py-1 rounded-full border border-white/10">
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Tracker visual — no se muestra en compact si está entregado */}
        {!compact && (
          <div className="pt-2">
            {/* Mobile: lista vertical */}
            <div className="flex sm:hidden flex-col gap-0">
              {ORDER_STATUSES.map((s, idx) => {
                const done = idx <= currentIdx;
                const current = idx === currentIdx;
                const Icon = s.icon;
                const isLast = idx === ORDER_STATUSES.length - 1;
                return (
                  <div key={s.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        current
                          ? "bg-[#DFFF00] border-[#DFFF00]"
                          : done
                          ? "bg-[#DFFF00]/15 border-[#DFFF00]/40"
                          : "bg-[#0A0A0A] border-white/10"
                      }`}
                        style={current ? { boxShadow: `0 0 14px ${s.glow}` } : {}}
                      >
                        <Icon className={`h-3.5 w-3.5 ${current ? "text-black" : done ? "text-[#DFFF00]" : "text-zinc-600"}`} />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-5 mt-1 ${done && !current ? "bg-[#DFFF00]/30" : "bg-white/5"}`} />
                      )}
                    </div>
                    <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
                      <p className={`text-sm font-medium leading-tight ${
                        current ? "text-[#DFFF00]" : done ? "text-zinc-300" : "text-zinc-600"
                      }`}>
                        {s.label}
                      </p>
                      {current && order.status_history?.at(-1)?.note && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {order.status_history.at(-1).note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: tracker horizontal */}
            <div className="hidden sm:block">
              <div className="relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/5" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-[#DFFF00] transition-all duration-700 ease-in-out"
                  style={{
                    width: currentIdx === 0
                      ? "0%"
                      : `calc(${(currentIdx / (ORDER_STATUSES.length - 1)) * 100}% - 8px)`
                  }}
                />
                <div className="relative flex justify-between px-0">
                  {ORDER_STATUSES.map((s, idx) => {
                    const done = idx <= currentIdx;
                    const current = idx === currentIdx;
                    const Icon = s.icon;
                    return (
                      <div key={s.key} className="flex flex-col items-center gap-2 max-w-[72px]">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            current
                              ? "bg-[#DFFF00] border-[#DFFF00]"
                              : done
                              ? "bg-[#DFFF00]/15 border-[#DFFF00]/40"
                              : "bg-[#0A0A0A] border-white/10"
                          }`}
                          style={current ? { boxShadow: `0 0 14px ${s.glow}` } : {}}
                        >
                          <Icon className={`h-3.5 w-3.5 ${current ? "text-black" : done ? "text-[#DFFF00]" : "text-zinc-600"}`} />
                        </div>
                        <span className={`text-[10px] text-center leading-tight ${
                          current ? "text-[#DFFF00] font-semibold" : done ? "text-zinc-400" : "text-zinc-600"
                        }`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nota del estado actual */}
              {order.status_history?.at(-1)?.note && (
                <div className="mt-4 p-3 bg-[#1A1A1A] rounded-lg border border-[#DFFF00]/10 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] mt-1.5 shrink-0" />
                  <p className="text-sm text-zinc-300">{order.status_history.at(-1).note}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compact: solo estado */}
        {compact && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span>Entregado el{" "}
              {order.status_history?.at(-1)?.date
                ? new Date(order.status_history.at(-1).date).toLocaleDateString("es-ES")
                : "—"}
            </span>
          </div>
        )}

        {/* Toggle historial */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-300 transition-colors pt-2 border-t border-white/5"
        >
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Historial de estados ({order.status_history?.length || 0})
          </span>
          {expanded
            ? <ChevronUp className="h-3.5 w-3.5" />
            : <ChevronDown className="h-3.5 w-3.5" />
          }
        </button>

        {/* Historial expandible */}
        {expanded && order.status_history?.length > 0 && (
          <div className="space-y-2 pt-2">
            {[...order.status_history].reverse().map((entry, i) => {
              const s = getStatus(entry.status);
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 bg-[#1A1A1A] rounded-lg">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200">{s.label}</p>
                    {entry.note && <p className="text-xs text-zinc-500 mt-0.5">{entry.note}</p>}
                  </div>
                  <span className="text-xs text-zinc-600 shrink-0">
                    {new Date(entry.date).toLocaleDateString("es-ES", {
                      day: "2-digit", month: "short"
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const StatusBadgeFull = ({ status }) => {
  const cfg = getStatus(status);
  const Icon = cfg.icon;
  return (
    <Badge className={`${cfg.bg} ${cfg.color} border-transparent gap-1`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
};

export default ClubOrders;
