import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileImage } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const KitDesign = () => {
  const { user } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDesigns = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/equipment-designs/${user.club_id}`);
      setDesigns(response.data);
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  return (
    <ClubLayout title="Diseño de Kit">
      <div className="space-y-8">
        <div>
          <p className="text-zinc-400">Visualiza los diseños de equipamiento aprobados por ADIVINA para tu club</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold uppercase mb-4">Diseños Aprobados</h2>
          {loading ? (
            <div className="text-center py-20">
              <p className="text-zinc-400">Cargando diseños...</p>
            </div>
          ) : designs.length === 0 ? (
            <Card className="bg-[#121212] border-white/10 p-12 text-center">
              <FileImage className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No hay diseños disponibles aún</p>
              <p className="text-zinc-600 text-sm mt-2">El administrador subirá los diseños de tu kit próximamente</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Card 
                  key={design.id} 
                  data-testid={`design-card-${design.id}`}
                  className="bg-[#121212] border-white/10 hover-lift cursor-pointer"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{design.design_name}</CardTitle>
                    <CardDescription className="text-zinc-500 text-xs">
                      {new Date(design.created_at).toLocaleDateString('es-ES')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {design.file_url ? (
                      <div className="aspect-square bg-[#1E1E1E] rounded border border-white/10 overflow-hidden">
                        <img 
                          src={`${BACKEND_URL}${design.file_url}`} 
                          alt={design.design_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-[#1E1E1E] rounded border border-white/10 flex items-center justify-center">
                        <FileImage className="h-12 w-12 text-zinc-700" />
                      </div>
                    )}
                    <div className="mt-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        design.status === 'approved' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {design.status === 'approved' ? 'APROBADO' : 'PENDIENTE'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClubLayout>
  );
};

export default KitDesign;
