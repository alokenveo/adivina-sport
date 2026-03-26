import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", priority: "normal" });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/news`);
      setNews(response.data);
    } catch (error) {
      toast.error('Error al cargar noticias');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/news`, formData);
      toast.success('Noticia creada');
      setShowDialog(false);
      setFormData({ title: "", content: "", priority: "normal" });
      fetchNews();
    } catch (error) {
      toast.error('Error al crear noticia');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/news/${id}`);
      toast.success('Noticia eliminada');
      fetchNews();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Gestión de Noticias</CardTitle>
            <CardDescription className="text-zinc-400">Publica anuncios para todos los clubes</CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#DFFF00] text-black hover:bg-white">
                <Plus className="mr-2 h-4 w-4" />Nueva Noticia
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Crear Noticia</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                </div>
                <div>
                  <Label>Contenido</Label>
                  <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2 min-h-32" />
                </div>
                <div>
                  <Label>Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})}>
                    <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-white/10">
                      <SelectItem value="normal" className="text-white">Normal</SelectItem>
                      <SelectItem value="high" className="text-white">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Publicar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="p-4 bg-[#1E1E1E] border border-white/5 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[#DFFF00]">{item.title}</h3>
                <Button onClick={() => handleDelete(item.id)} size="icon" variant="ghost" className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <p className="text-zinc-400 text-sm mb-2">{item.content}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${item.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700 text-zinc-400'}`}>
                  {item.priority === 'high' ? 'URGENTE' : 'NORMAL'}
                </span>
                <span className="text-xs text-zinc-600">{new Date(item.created_at).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsManagement;