import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Palette, Plus, Save } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EquipmentDesign = () => {
  const { user } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDesign, setShowNewDesign] = useState(false);
  const [designName, setDesignName] = useState("");
  const [designNotes, setDesignNotes] = useState("");
  const [colorPrimary, setColorPrimary] = useState("#000000");
  const [colorSecondary, setColorSecondary] = useState("#DFFF00");

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

  const handleSaveDesign = async (e) => {
    e.preventDefault();
    
    if (!designName) {
      toast.error('Please enter a design name');
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/equipment-designs/${user.club_id}`, {
        design_name: designName,
        design_data: {
          colors: {
            primary: colorPrimary,
            secondary: colorSecondary
          },
          notes: designNotes
        }
      });
      
      toast.success('Design saved successfully!');
      setDesignName("");
      setDesignNotes("");
      setColorPrimary("#000000");
      setColorSecondary("#DFFF00");
      setShowNewDesign(false);
      fetchDesigns();
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error('Failed to save design');
    }
  };

  return (
    <ClubLayout title="Equipment Design">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <p className="text-zinc-400">Design custom equipment for your club</p>
          <Button 
            data-testid="create-new-design-button"
            onClick={() => setShowNewDesign(!showNewDesign)}
            className="bg-[#DFFF00] text-black hover:bg-white font-bold uppercase tracking-wider rounded-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            NEW DESIGN
          </Button>
        </div>

        {showNewDesign && (
          <Card className="bg-[#121212] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#DFFF00]" />
                Create New Design
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Customize your equipment colors and specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveDesign} className="space-y-6">
                <div>
                  <Label htmlFor="designName" className="text-zinc-300">Design Name</Label>
                  <Input
                    id="designName"
                    data-testid="design-name-input"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="e.g., 2026 Home Kit"
                    className="bg-[#0A0A0A] border-white/10 text-white mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="colorPrimary" className="text-zinc-300">Primary Color</Label>
                    <div className="flex gap-3 mt-2">
                      <Input
                        id="colorPrimary"
                        data-testid="color-primary-input"
                        type="color"
                        value={colorPrimary}
                        onChange={(e) => setColorPrimary(e.target.value)}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        value={colorPrimary}
                        onChange={(e) => setColorPrimary(e.target.value)}
                        className="bg-[#0A0A0A] border-white/10 text-white flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="colorSecondary" className="text-zinc-300">Secondary Color</Label>
                    <div className="flex gap-3 mt-2">
                      <Input
                        id="colorSecondary"
                        data-testid="color-secondary-input"
                        type="color"
                        value={colorSecondary}
                        onChange={(e) => setColorSecondary(e.target.value)}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        value={colorSecondary}
                        onChange={(e) => setColorSecondary(e.target.value)}
                        className="bg-[#0A0A0A] border-white/10 text-white flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="designNotes" className="text-zinc-300">Design Notes</Label>
                  <Textarea
                    id="designNotes"
                    data-testid="design-notes-input"
                    value={designNotes}
                    onChange={(e) => setDesignNotes(e.target.value)}
                    placeholder="Add any specific requirements or notes..."
                    className="bg-[#0A0A0A] border-white/10 text-white mt-2 min-h-32"
                  />
                </div>

                <div>
                  <Label className="text-zinc-300">Color Preview</Label>
                  <div className="mt-2 flex gap-4">
                    <div 
                      className="w-32 h-32 rounded-lg border border-white/10 flex items-center justify-center"
                      style={{ backgroundColor: colorPrimary }}
                    >
                      <span className="text-xs font-bold" style={{ color: colorSecondary }}>PRIMARY</span>
                    </div>
                    <div 
                      className="w-32 h-32 rounded-lg border border-white/10 flex items-center justify-center"
                      style={{ backgroundColor: colorSecondary }}
                    >
                      <span className="text-xs font-bold" style={{ color: colorPrimary }}>SECONDARY</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    data-testid="save-design-button"
                    type="submit"
                    className="bg-[#DFFF00] text-black hover:bg-white font-bold uppercase tracking-wider rounded-sm"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    SAVE DESIGN
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setShowNewDesign(false)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold uppercase mb-4">Saved Designs</h2>
          {loading ? (
            <div className="text-center py-20">
              <p className="text-zinc-400">Loading designs...</p>
            </div>
          ) : designs.length === 0 ? (
            <Card className="bg-[#121212] border-white/10 p-12 text-center">
              <Palette className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No designs yet. Create your first design!</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Card 
                  key={design.id} 
                  data-testid={`design-card-${design.id}`}
                  className="bg-[#121212] border-white/10 hover-lift"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{design.design_name}</CardTitle>
                    <CardDescription className="text-zinc-500 text-xs">
                      {new Date(design.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <div 
                        className="flex-1 h-20 rounded border border-white/10"
                        style={{ backgroundColor: design.design_data.colors?.primary || '#000' }}
                      />
                      <div 
                        className="flex-1 h-20 rounded border border-white/10"
                        style={{ backgroundColor: design.design_data.colors?.secondary || '#DFFF00' }}
                      />
                    </div>
                    {design.design_data.notes && (
                      <p className="text-sm text-zinc-400 line-clamp-2">{design.design_data.notes}</p>
                    )}
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

export default EquipmentDesign;
