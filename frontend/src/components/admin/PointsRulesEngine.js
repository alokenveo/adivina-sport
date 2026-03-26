import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Settings } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PointsRulesEngine = () => {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    name: "",
    event_type: "purchase",
    points_per_unit: 1,
    multiplier: 1,
    description: ""
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/points-rules`);
      setRules(response.data || []);
    } catch (error) {
      console.error('Error loading rules');
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/points-rules`, newRule);
      toast.success('Regla creada');
      setNewRule({ name: "", event_type: "purchase", points_per_unit: 1, multiplier: 1, description: "" });
      fetchRules();
    } catch (error) {
      toast.error('Error al crear regla');
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/points-rules/${id}`);
      toast.success('Regla eliminada');
      fetchRules();
    } catch (error) {
      toast.error('Error');
    }
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#DFFF00]/10 rounded-lg">
            <Settings className="h-6 w-6 text-[#DFFF00]" />
          </div>
          <div>
            <CardTitle className="text-2xl">Motor de Reglas de Puntos</CardTitle>
            <CardDescription className="text-zinc-400">Configura cálculo automático de puntos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-br from-[#DFFF00]/5 to-transparent rounded-lg border border-[#DFFF00]/20">
          <h3 className="font-bold mb-4 text-[#DFFF00] flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Crear Nueva Regla
          </h3>
          <form onSubmit={handleCreateRule} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre de la Regla</Label>
                <Input value={newRule.name} onChange={(e) => setNewRule({...newRule, name: e.target.value})} placeholder="Ej: Compra estándar" className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
              </div>
              <div>
                <Label>Tipo de Evento</Label>
                <Select value={newRule.event_type} onValueChange={(val) => setNewRule({...newRule, event_type: val})}>
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    <SelectItem value="purchase" className="text-white">Compra</SelectItem>
                    <SelectItem value="early_payment" className="text-white">Pago Anticipado</SelectItem>
                    <SelectItem value="contract_signed" className="text-white">Contrato Firmado</SelectItem>
                    <SelectItem value="milestone" className="text-white">Hito Alcanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Puntos por Unidad</Label>
                <Input type="number" value={newRule.points_per_unit} onChange={(e) => setNewRule({...newRule, points_per_unit: parseInt(e.target.value)})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
              </div>
              <div>
                <Label>Multiplicador</Label>
                <Input type="number" step="0.1" value={newRule.multiplier} onChange={(e) => setNewRule({...newRule, multiplier: parseFloat(e.target.value)})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={newRule.description} onChange={(e) => setNewRule({...newRule, description: e.target.value})} placeholder="Describe cómo funciona esta regla" className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
            </div>
            <Button type="submit" className="bg-[#DFFF00] text-black hover:bg-white">
              <Plus className="mr-2 h-4 w-4" />Crear Regla
            </Button>
          </form>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-lg">Reglas Activas</h3>
          {rules.length === 0 ? (
            <p className="text-center py-8 text-zinc-500">No hay reglas configuradas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-zinc-400">NOMBRE</TableHead>
                  <TableHead className="text-zinc-400">EVENTO</TableHead>
                  <TableHead className="text-zinc-400">PUNTOS</TableHead>
                  <TableHead className="text-zinc-400">MULTIPLICADOR</TableHead>
                  <TableHead className="text-zinc-400">ACCIONES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} className="border-white/10">
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell><span className="px-2 py-1 bg-[#DFFF00]/20 text-[#DFFF00] rounded text-xs">{rule.event_type}</span></TableCell>
                    <TableCell className="text-[#DFFF00] font-bold">{rule.points_per_unit}</TableCell>
                    <TableCell className="text-zinc-400">x{rule.multiplier}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleDeleteRule(rule.id)} size="icon" variant="ghost" className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-bold text-blue-400 mb-2">Cómo funciona</h4>
          <ul className="text-sm text-zinc-400 space-y-1">
            <li>• Las reglas se aplican automáticamente cuando ocurre un evento</li>
            <li>• Puntos totales = (Puntos por unidad × Valor del evento) × Multiplicador</li>
            <li>• Ejemplo: Compra de $100 con 1 punto/$10 y multiplicador 1.5 = 15 puntos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsRulesEngine;