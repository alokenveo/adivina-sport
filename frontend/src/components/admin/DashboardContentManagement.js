import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DashboardContentManagement = () => {
  const [content, setContent] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ section_title: "", content: "", order: 0 });

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/dashboard-content`);
      setContent(response.data);
    } catch (error) {
      toast.error('Error al cargar contenido');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/dashboard-content`, formData);
      toast.success('Contenido agregado');
      setShowDialog(false);
      setFormData({ section_title: "", content: "", order: 0 });
      fetchContent();
    } catch (error) {
      toast.error('Error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/dashboard-content/${id}`);
      toast.success('Eliminado');
      fetchContent();
    } catch (error) {
      toast.error('Error');
    }
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-2xl">Contenido del Dashboard</CardTitle>
            <CardDescription className="text-zinc-400">Edita lo que ven los clubes en su panel principal</CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#DFFF00] text-black hover:bg-white w-full sm:w-auto shrink-0">
                <Plus className="mr-2 h-4 w-4" />Agregar Sección
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Nueva Sección</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Título de Sección</Label>
                  <Input value={formData.section_title} onChange={(e) => setFormData({...formData, section_title: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                </div>
                <div>
                  <Label>Contenido</Label>
                  <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                </div>
                <div>
                  <Label>Orden</Label>
                  <Input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                </div>
                <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Crear</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {content.map((item) => (
            <div key={item.id} className="p-4 bg-[#1E1E1E] rounded-lg border border-white/5">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-[#DFFF00] min-w-0 break-words">{item.section_title}</h3>
                <Button onClick={() => handleDelete(item.id)} size="icon" variant="ghost" className="text-red-400 shrink-0"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <p className="text-sm text-zinc-400">{item.content}</p>
              <p className="text-xs text-zinc-600 mt-2">Orden: {item.order}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardContentManagement;
