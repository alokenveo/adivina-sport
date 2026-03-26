import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FolderOpen } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MemberDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/documents/club/${user.club_id}`);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Error loading documents');
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  const categoryNames = {
    general: 'General',
    policy: 'Políticas',
    guide: 'Guías',
    catalog: 'Catálogos'
  };

  return (
    <ClubLayout title="Biblioteca de Documentos">
      {loading ? (
        <div className="text-center py-20">
          <p className="text-zinc-400">Cargando documentos...</p>
        </div>
      ) : documents.length === 0 ? (
        <Card className="bg-[#121212] border-white/10 p-12 text-center">
          <FolderOpen className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No hay documentos disponibles aún</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocs).map(([category, docs]) => (
            <Card key={category} className="bg-[#121212] border-white/10">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#DFFF00]" />
                  {categoryNames[category] || category}
                </CardTitle>
                <CardDescription className="text-zinc-400">{docs.length} documento(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {docs.map((doc) => (
                    <div key={doc.id} className="p-4 bg-[#1E1E1E] border border-white/10 rounded-lg hover:border-[#DFFF00]/30 transition-colors cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-white group-hover:text-[#DFFF00] transition-colors">{doc.title}</h4>
                          <p className="text-xs text-zinc-500 mt-1">
                            Subido: {new Date(doc.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <Button 
                          size="icon" 
                          onClick={() => window.open(`${BACKEND_URL}${doc.file_url}`, '_blank')}
                          className="bg-[#DFFF00] text-black hover:bg-white"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ClubLayout>
  );
};

export default MemberDocuments;