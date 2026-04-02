import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Package, Plus, Trash2, ChevronRight, Clock, CheckCircle2,
  Truck, Star, Settings, FlaskConical, PackageCheck, Edit
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ORDER_STATUSES = [
  { key: "received",   label: "Pedido Recibido",     icon: Package,      color: "text-zinc-400",  bg: "bg-zinc-500/20",  border: "border-zinc-500/30"  },
  { key: "preparing",  label: "En Preparación",       icon: Settings,     color: "text-blue-400",  bg: "bg-blue-500/20",  border: "border-blue-500/30"  },
  { key: "production", label: "En Producción",        icon: FlaskConical, color: "text-purple-400",bg: "bg-purple-500/20",border: "border-purple-500/30"},
  { key: "quality",    label: "Control de Calidad",   icon: Star,         color: "text-yellow-400",bg: "bg-yellow-500/20",border: "border-yellow-500/30"},
  { key: "ready",      label: "Listo para Envío",     icon: PackageCheck, color: "text-cyan-400",  bg: "bg-cyan-500/20",  border: "border-cyan-500/30"  },
  { key: "shipped",    label: "Enviado",              icon: Truck,        color: "text-orange-400",bg: "bg-orange-500/20",border: "border-orange-500/30"},
  { key: "delivered",  label: "Entregado",            icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" },
];

const getStatusConfig = (key) =>
  ORDER_STATUSES.find(s => s.key === key) || ORDER_STATUSES[0];

const StatusBadge = ({ status }) => {
  const cfg = getStatusConfig(status);
  const Icon = cfg.icon;
  return (
    <Badge className={`${cfg.bg} ${cfg.color} ${cfg.border} border gap-1`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
};

const OrdersManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [loading, setLoading] = useState(false);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Create form
  const [createForm, setCreateForm] = useState({
    description: "",
    items: "",
    notes: ""
  });

  // Update form
  const [updateForm, setUpdateForm] = useState({
    status: "",
    note: ""
  });

  const fetchClubs = useCallback(async () => {
    const res = await axios.get(`${BACKEND_URL}/api/clubs`);
    setClubs(res.data);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/orders`);
      const all = res.data;
      setOrders(selectedClub ? all.filter(o => o.club_id === selectedClub) : all);
    } catch {
      toast.error("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }, [selectedClub]);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedClub || !createForm.description) {
      toast.error("Selecciona un club y añade una descripción");
      return;
    }
    try {
      const items = createForm.items
        ? createForm.items.split("\n").map(l => l.trim()).filter(Boolean)
        : [];
      await axios.post(`${BACKEND_URL}/api/admin/orders`, {
        club_id: selectedClub,
        description: createForm.description,
        items,
        notes: createForm.notes
      });
      toast.success("Pedido creado");
      setCreateOpen(false);
      setCreateForm({ description: "", items: "", notes: "" });
      fetchOrders();
    } catch {
      toast.error("Error al crear pedido");
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!updateForm.status) {
      toast.error("Selecciona un estado");
      return;
    }
    try {
      await axios.put(`${BACKEND_URL}/api/admin/orders/${selectedOrder.id}`, {
        status: updateForm.status,
        note: updateForm.note
      });
      toast.success("Estado actualizado");
      setUpdateOpen(false);
      setUpdateForm({ status: "", note: "" });
      fetchOrders();
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("¿Eliminar este pedido?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/orders/${orderId}`);
      toast.success("Pedido eliminado");
      fetchOrders();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const openUpdate = (order) => {
    setSelectedOrder(order);
    setUpdateForm({ status: order.status, note: "" });
    setUpdateOpen(true);
  };

  const clubName = (id) => clubs.find(c => c.id === id)?.name || id;

  const statusIndex = (key) => ORDER_STATUSES.findIndex(s => s.key === key);

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Package className="h-6 w-6 text-[#DFFF00]" />
              Gestión de Pedidos
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Registra y actualiza el estado de los pedidos de cada club
            </CardDescription>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#DFFF00] text-black hover:bg-white w-full sm:w-auto shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtro por club */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label className="text-zinc-400 text-xs mb-1 block">Filtrar por club</Label>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white">
                <SelectValue placeholder="Todos los clubes" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] border-white/10">
                <SelectItem value="todos" className="text-white">Todos los clubes</SelectItem>
                {clubs.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-white">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de pedidos */}
        {loading ? (
          <p className="text-zinc-400 text-center py-8">Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hay pedidos registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const currentIdx = statusIndex(order.status);
              return (
                <div
                  key={order.id}
                  className="p-5 bg-[#1A1A1A] rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  {/* Header del pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-white">{order.description}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-zinc-500">
                        {clubName(order.club_id)} · {new Date(order.created_at).toLocaleDateString("es-ES")}
                      </p>
                      {order.items?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {order.items.map((item, i) => (
                            <span key={i} className="text-xs bg-white/5 text-zinc-400 px-2 py-0.5 rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => openUpdate(order)}
                        className="bg-[#DFFF00] text-black hover:bg-white text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Estado
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(order.id)}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Barra de progreso visual */}
                  <div className="relative">
                    {/* Línea de fondo */}
                    <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-white/5" />
                    {/* Línea de progreso */}
                    <div
                      className="absolute top-3.5 left-0 h-0.5 bg-[#DFFF00] transition-all duration-700"
                      style={{ width: `${(currentIdx / (ORDER_STATUSES.length - 1)) * 100}%` }}
                    />
                    {/* Puntos */}
                    <div className="relative flex justify-between">
                      {ORDER_STATUSES.map((s, idx) => {
                        const done = idx <= currentIdx;
                        const current = idx === currentIdx;
                        const Icon = s.icon;
                        return (
                          <div key={s.key} className="flex flex-col items-center gap-1.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                done
                                  ? current
                                    ? "bg-[#DFFF00] border-[#DFFF00] shadow-[0_0_12px_rgba(223,255,0,0.5)]"
                                    : "bg-[#DFFF00]/20 border-[#DFFF00]/50"
                                  : "bg-[#0A0A0A] border-white/10"
                              }`}
                            >
                              <Icon className={`h-3 w-3 ${done ? current ? "text-black" : "text-[#DFFF00]" : "text-zinc-600"}`} />
                            </div>
                            <span className={`text-[9px] leading-tight text-center max-w-[52px] hidden sm:block ${
                              done ? current ? "text-[#DFFF00] font-semibold" : "text-zinc-400" : "text-zinc-600"
                            }`}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Último historial */}
                  {order.status_history?.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        Última actualización:{" "}
                        {new Date(order.status_history.at(-1).date).toLocaleDateString("es-ES", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                        {order.status_history.at(-1).note && ` · ${order.status_history.at(-1).note}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Dialog: Crear pedido */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#DFFF00]" />
              Nuevo Pedido
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Club *</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-2">
                  <SelectValue placeholder="Selecciona un club" />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  {clubs.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-white">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción del pedido *</Label>
              <Input
                value={createForm.description}
                onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Ej: Kit completo temporada 2026"
                className="mt-2 bg-[#0A0A0A] border-white/10"
              />
            </div>
            <div>
              <Label>Artículos (uno por línea)</Label>
              <Textarea
                value={createForm.items}
                onChange={e => setCreateForm(p => ({ ...p, items: e.target.value }))}
                placeholder={"Camiseta local x20\nPantalón x20\nMedias x20"}
                className="mt-2 bg-[#0A0A0A] border-white/10 min-h-[100px]"
              />
            </div>
            <div>
              <Label>Notas internas</Label>
              <Input
                value={createForm.notes}
                onChange={e => setCreateForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Notas adicionales..."
                className="mt-2 bg-[#0A0A0A] border-white/10"
              />
            </div>
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">
              <Plus className="mr-2 h-4 w-4" />
              Crear Pedido
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Actualizar estado */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-[#DFFF00]" />
              Actualizar Estado
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="p-3 bg-[#1E1E1E] rounded-lg border border-white/5">
                <p className="text-sm font-medium">{selectedOrder.description}</p>
                <p className="text-xs text-zinc-500">{clubName(selectedOrder.club_id)}</p>
              </div>
              <div>
                <Label>Nuevo estado *</Label>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {ORDER_STATUSES.map((s) => {
                    const Icon = s.icon;
                    const selected = updateForm.status === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setUpdateForm(p => ({ ...p, status: s.key }))}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                          selected
                            ? "bg-[#DFFF00]/10 border-[#DFFF00]/50 text-white"
                            : "bg-[#0A0A0A] border-white/5 text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${selected ? "bg-[#DFFF00]" : "bg-white/5"}`}>
                          <Icon className={`h-3.5 w-3.5 ${selected ? "text-black" : "text-zinc-500"}`} />
                        </div>
                        <span className="text-sm font-medium">{s.label}</span>
                        {selectedOrder.status === s.key && (
                          <span className="ml-auto text-xs text-zinc-500">Actual</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Nota para el club (opcional)</Label>
                <Input
                  value={updateForm.note}
                  onChange={e => setUpdateForm(p => ({ ...p, note: e.target.value }))}
                  placeholder="Ej: Materiales confirmados, iniciando corte..."
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                />
              </div>
              <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">
                Guardar Estado
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OrdersManagement;
