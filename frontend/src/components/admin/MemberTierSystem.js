import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Save, Award } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MemberTierSystem = () => {
  const [tiers, setTiers] = useState([
    { id: 'silver', name: 'Silver', min_points: 0, color: '#C0C0C0', benefits: '' },
    { id: 'gold', name: 'Gold', min_points: 1000, color: '#FFD700', benefits: '' },
    { id: 'premium', name: 'Premium', min_points: 2500, color: '#E5E4E2', benefits: '' },
    { id: 'elite', name: 'Elite', min_points: 5000, color: '#DFFF00', benefits: '' }
  ]);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/member-tiers`);
      if (response.data && response.data.length > 0) {
        setTiers(response.data);
      }
    } catch (error) {
      console.log('Using default tiers');
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/member-tiers`, { tiers });
      toast.success('Niveles de membresía actualizados');
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const updateTier = (id, field, value) => {
    setTiers(tiers.map(t => t.id === id ? {...t, [field]: value} : t));
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#DFFF00]/10 rounded-lg">
            <Award className="h-6 w-6 text-[#DFFF00]" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sistema de Niveles de Membresía</CardTitle>
            <CardDescription className="text-zinc-400">Configura los rangos y beneficios según puntos acumulados</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-[#DFFF00]/10 to-transparent border-l-4 border-[#DFFF00] rounded">
          <p className="text-sm text-zinc-300"><strong>Sistema Automático:</strong> Los miembros suben de nivel automáticamente al alcanzar los puntos requeridos.</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-zinc-400">NIVEL</TableHead>
              <TableHead className="text-zinc-400">PUNTOS MÍNIMOS</TableHead>
              <TableHead className="text-zinc-400">COLOR</TableHead>
              <TableHead className="text-zinc-400">BENEFICIOS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.map((tier) => (
              <TableRow key={tier.id} className="border-white/10">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full" style={{backgroundColor: tier.color}} />
                    <Input 
                      value={tier.name} 
                      onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                      className="bg-[#0A0A0A] border-white/10 text-white w-32"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={tier.min_points} 
                    onChange={(e) => updateTier(tier.id, 'min_points', parseInt(e.target.value))}
                    className="bg-[#0A0A0A] border-white/10 text-white w-32"
                  />
                </TableCell>
                <TableCell>
                  <input 
                    type="color" 
                    value={tier.color} 
                    onChange={(e) => updateTier(tier.id, 'color', e.target.value)}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    value={tier.benefits} 
                    onChange={(e) => updateTier(tier.id, 'benefits', e.target.value)}
                    placeholder="Ej: 10% descuento"
                    className="bg-[#0A0A0A] border-white/10 text-white"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button onClick={handleSave} className="bg-[#DFFF00] text-black hover:bg-white w-full py-6">
          <Save className="mr-2 h-5 w-5" />
          Guardar Configuración de Niveles
        </Button>

        <div className="grid md:grid-cols-4 gap-4 mt-6">
          {tiers.map((tier) => (
            <div key={tier.id} className="p-4 bg-[#1E1E1E] rounded-lg border-2" style={{borderColor: tier.color}}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full" style={{backgroundColor: tier.color}} />
                <h3 className="font-bold">{tier.name}</h3>
              </div>
              <p className="text-2xl font-bold" style={{color: tier.color}}>{tier.min_points}+ pts</p>
              <p className="text-xs text-zinc-500 mt-2">{tier.benefits || 'Sin beneficios configurados'}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberTierSystem;