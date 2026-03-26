import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, TrendingUp } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ClubPoints = () => {
  const { user } = useAuth();
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPoints = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/points/${user.club_id}`);
      setPointsData(response.data);
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  return (
    <ClubLayout title="Sistema de Puntos">
      {loading ? (
        <div className="text-center py-20">
          <p className="text-zinc-400">Cargando datos de puntos...</p>
        </div>
      ) : !pointsData ? (
        <Card className="bg-[#121212] border-white/10 p-12 text-center">
          <p className="text-zinc-400">No se encontraron datos de puntos</p>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-[#121212] border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Saldo Actual</CardTitle>
                    <CardDescription className="text-zinc-400">Tus puntos de lealtad</CardDescription>
                  </div>
                  <div className="p-3 bg-[#DFFF00]/10 rounded-lg">
                    <Trophy className="h-8 w-8 text-[#DFFF00]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-6xl font-bold text-[#DFFF00]" data-testid="points-balance">
                  {pointsData.balance}
                </div>
                <p className="text-sm text-zinc-500 mt-2">Puntos</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Información de Recompensas</CardTitle>
                    <CardDescription className="text-zinc-400">Cómo usar tus puntos</CardDescription>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full mt-1.5" />
                    <span>Gana 1 punto por cada $10 gastados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full mt-1.5" />
                    <span>Canjea puntos por descuentos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full mt-1.5" />
                    <span>Puntos bonus por pagos anticipados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#DFFF00] rounded-full mt-1.5" />
                    <span>Acceso exclusivo a nuevos productos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#121212] border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Historial de Puntos</CardTitle>
              <CardDescription className="text-zinc-400">Transacciones y actividades recientes</CardDescription>
            </CardHeader>
            <CardContent>
              {pointsData.history && pointsData.history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400">FECHA</TableHead>
                      <TableHead className="text-zinc-400">ACCIÓN</TableHead>
                      <TableHead className="text-zinc-400">PUNTOS</TableHead>
                      <TableHead className="text-zinc-400">DESCRIPCIÓN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointsData.history.map((entry, idx) => (
                      <TableRow 
                        key={idx} 
                        data-testid={`points-history-${idx}`}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="text-zinc-400">
                          {new Date(entry.date).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell className="font-medium">{entry.action}</TableCell>
                        <TableCell className="font-bold text-[#DFFF00]">
                          +{entry.points}
                        </TableCell>
                        <TableCell className="text-zinc-400">{entry.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-zinc-500">No hay historial disponible</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </ClubLayout>
  );
};

export default ClubPoints;
