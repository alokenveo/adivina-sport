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
import { Edit } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PointsManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [points, setPoints] = useState({});
  const [selectedClub, setSelectedClub] = useState("");
  const [newBalance, setNewBalance] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    const response = await axios.get(`${BACKEND_URL}/api/clubs`);
    setClubs(response.data);
    const pointsData = {};
    for (const club of response.data) {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/points/${club.id}`);
        pointsData[club.id] = res.data;
      } catch (e) {}
    }
    setPoints(pointsData);
  };

  const handleUpdatePoints = async (e) => {
    e.preventDefault();
    if (!selectedClub || !newBalance || !note) {
      toast.error('Completa todos los campos');
      return;
    }
    try {
      await axios.put(`${BACKEND_URL}/api/points/${selectedClub}`, {
        balance: parseInt(newBalance),
        note
      });
      toast.success('Puntos actualizados');
      setNewBalance("");
      setNote("");
      fetchClubs();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl">Gestión de Puntos</CardTitle>
        <CardDescription className="text-zinc-400">Modifica el saldo de puntos de cualquier club</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-[#1E1E1E] rounded-lg border border-white/10">
          <h3 className="font-bold mb-4 text-[#DFFF00]">Modificar Puntos</h3>
          <form onSubmit={handleUpdatePoints} className="space-y-4">
            <div>
              <Label>Selecciona Club</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-2">
                  <SelectValue placeholder="Elige un club" />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id} className="text-white">
                      {club.name} (Actual: {points[club.id]?.balance || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nuevo Saldo de Puntos</Label>
              <Input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
            </div>
            <div>
              <Label>Nota/Razón</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: Ajuste manual" className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
            </div>
            <Button type="submit" className="bg-[#DFFF00] text-black hover:bg-white">
              <Edit className="mr-2 h-4 w-4" />Actualizar Puntos
            </Button>
          </form>
        </div>

        <div>
          <h3 className="font-bold mb-4">Vista General de Puntos</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-zinc-400">CLUB</TableHead>
                <TableHead className="text-zinc-400">SALDO ACTUAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id} className="border-white/10">
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell className="text-[#DFFF00] font-bold text-xl">{points[club.id]?.balance || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsManagement;