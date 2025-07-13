import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit, Trash2, Save, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const emptyCard = {
  id: undefined,
  name: "",
  description: "",
  price: "",
  duration: "",
  features: [""],
  photo: ""
};

export const ManageDetailing = () => {
  // Gallery image state
  const [beforeImage, setBeforeImage] = useState<string>("");
  const [afterImage, setAfterImage] = useState<string>("");
  const [showBeforeInput, setShowBeforeInput] = useState(false);
  const [showAfterInput, setShowAfterInput] = useState(false);
  const [beforeInput, setBeforeInput] = useState("");
  const [afterInput, setAfterInput] = useState("");
  const [galleryId, setGalleryId] = useState<number | null>(null);

  // Service cards state
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit card form state
  const [showAddCard, setShowAddCard] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [newCard, setNewCard] = useState({ ...emptyCard });

  // Load services and gallery images on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // fetch detailing services
      const { data: serviceData } = await supabase.from("detailing_services").select("*").order("id");
      setServices(serviceData || []);
      // fetch gallery (single row)
      const { data: galleryData } = await supabase.from("detailing_gallery").select("*").limit(1).single();
      if (galleryData) {
        setBeforeImage(galleryData.before_image_url || "");
        setAfterImage(galleryData.after_image_url || "");
        setGalleryId(galleryData.id);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Save before image URL to supabase
  const handleSaveBefore = async () => {
    setBeforeImage(beforeInput);
    setShowBeforeInput(false);
    setBeforeInput("");
    if (galleryId) {
      await supabase.from("detailing_gallery").update({ before_image_url: beforeInput }).eq("id", galleryId);
    } else {
      const { data } = await supabase.from("detailing_gallery").insert([{ before_image_url: beforeInput, after_image_url: afterImage }]).select().single();
      setGalleryId(data?.id);
    }
  };

  // Save after image URL to supabase
  const handleSaveAfter = async () => {
    setAfterImage(afterInput);
    setShowAfterInput(false);
    setAfterInput("");
    if (galleryId) {
      await supabase.from("detailing_gallery").update({ after_image_url: afterInput }).eq("id", galleryId);
    } else {
      const { data } = await supabase.from("detailing_gallery").insert([{ before_image_url: beforeImage, after_image_url: afterInput }]).select().single();
      setGalleryId(data?.id);
    }
  };

  // Add new service
  const handleAddCard = async () => {
    const insertRes = await supabase.from("detailing_services").insert([{
      name: newCard.name,
      description: newCard.description,
      price: Number(newCard.price),
      duration: newCard.duration,
      features: newCard.features.filter(f => f.trim()),
      photo: newCard.photo
    }]).select();
    if (insertRes.data) setServices(s => [...s, insertRes.data[0]]);
    setShowAddCard(false);
    setNewCard({ ...emptyCard });
  };

  // Remove a service
  const handleRemoveCard = async (idx: number) => {
    const id = services[idx].id;
    await supabase.from("detailing_services").delete().eq("id", id);
    setServices(s => s.filter((_, i) => i !== idx));
  };

  // Edit handlers
  const handleEditCard = (idx: number) => {
    setEditIdx(idx);
    setShowAddCard(false);
    const c = services[idx];
    setNewCard({
      id: c.id,
      name: c.name,
      description: c.description,
      price: String(c.price),
      duration: c.duration,
      features: Array.isArray(c.features) ? [...c.features] : [],
      photo: c.photo || ""
    });
  };
  const handleSaveEditCard = async () => {
    if (editIdx === null || !newCard.id) return;
    const updateObj = {
      name: newCard.name,
      description: newCard.description,
      price: Number(newCard.price),
      duration: newCard.duration,
      features: newCard.features.filter(f => f.trim()),
      photo: newCard.photo
    };
    await supabase.from("detailing_services").update(updateObj).eq("id", newCard.id);
    setServices(s =>
      s.map((card, idx) =>
        idx === editIdx ? { ...updateObj, id: newCard.id } : card
      )
    );
    setEditIdx(null);
    setNewCard({ ...emptyCard });
  };
  const handleCancelEdit = () => {
    setEditIdx(null);
    setNewCard({ ...emptyCard });
  };

  // For Add, always show empty form
  const handleShowAddCard = () => {
    setShowAddCard(true);
    setEditIdx(null);
    setNewCard({ ...emptyCard });
  };

  if (loading) return <div className="text-center py-12 text-xl">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Before & After Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="overflow-hidden relative group">
          <img src={beforeImage} alt="Before" className="w-full h-32 object-cover" />
          <Badge className="absolute top-2 left-2 bg-red-500">BEFORE</Badge>
          <Button
            variant="ghost"
            className="absolute bottom-2 right-2 text-xs flex items-center gap-1"
            onClick={() => setShowBeforeInput(true)}
          >
            <ImagePlus className="w-4 h-4" /> Replace URL
          </Button>
          {showBeforeInput && (
            <div className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center z-10">
              <div className="mb-2 w-3/4">
                <Input
                  autoFocus
                  placeholder="Paste before image URL"
                  value={beforeInput}
                  onChange={e => setBeforeInput(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveBefore} disabled={!beforeInput}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setShowBeforeInput(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
        <Card className="overflow-hidden relative group">
          <img src={afterImage} alt="After" className="w-full h-32 object-cover" />
          <Badge className="absolute top-2 left-2 bg-green-500">AFTER</Badge>
          <Button
            variant="ghost"
            className="absolute bottom-2 right-2 text-xs flex items-center gap-1"
            onClick={() => setShowAfterInput(true)}
          >
            <ImagePlus className="w-4 h-4" /> Replace URL
          </Button>
          {showAfterInput && (
            <div className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center z-10">
              <div className="mb-2 w-3/4">
                <Input
                  autoFocus
                  placeholder="Paste after image URL"
                  value={afterInput}
                  onChange={e => setAfterInput(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveAfter} disabled={!afterInput}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAfterInput(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Detailing Services</h2>
        <Button onClick={handleShowAddCard} variant="default" className="bg-pink-600 hover:bg-pink-700">
          + Add New Service
        </Button>
      </div>

      {/* List cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, idx) => (
          <Card key={service.id} className="border-0 shadow-md relative">
            {editIdx === idx ? (
              <div className="p-4">
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Name</label>
                  <Input value={newCard.name} onChange={e => setNewCard(c => ({ ...c, name: e.target.value }))} />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <Input value={newCard.description} onChange={e => setNewCard(c => ({ ...c, description: e.target.value }))} />
                </div>
                <div className="mb-2 flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">Price</label>
                    <Input type="number" value={newCard.price} onChange={e => setNewCard(c => ({ ...c, price: e.target.value }))} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">Duration</label>
                    <Input value={newCard.duration} onChange={e => setNewCard(c => ({ ...c, duration: e.target.value }))} />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Photo URL</label>
                  <Input value={newCard.photo} onChange={e => setNewCard(c => ({ ...c, photo: e.target.value }))} />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Features</label>
                  {newCard.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-center gap-1 mb-1">
                      <Input
                        value={feature}
                        onChange={e => {
                          const updated = [...newCard.features];
                          updated[fidx] = e.target.value;
                          setNewCard(c => ({ ...c, features: updated }));
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setNewCard(c => ({ ...c, features: c.features.filter((_, i) => i !== fidx) }))}
                        variant="ghost"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setNewCard(c => ({ ...c, features: [...c.features, ""] }))}
                    className="mt-1"
                  >
                    + Add Feature
                  </Button>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                  <Button onClick={handleSaveEditCard} disabled={!newCard.name || !newCard.price || !newCard.photo}>
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <CardHeader className="text-center pb-4">
                  {service.photo && (
                    <img
                      src={service.photo}
                      alt={service.name}
                      className="mx-auto mb-4 h-32 w-32 object-cover object-center rounded-lg shadow"
                    />
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <span>⏱</span>
                      {service.duration}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-pink-600">${service.price}</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900">{service.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    {Array.isArray(service.features) && service.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="w-1/2 flex items-center justify-center gap-1"
                      onClick={() => handleEditCard(idx)}>
                      <Edit className="w-4 h-4" /> Edit
                    </Button>
                    <Button variant="destructive" className="w-1/2 flex items-center justify-center gap-1"
                      onClick={() => handleRemoveCard(idx)}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Add new service card dialog */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-3">Add New Detailing Service</h3>
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1">Name</label>
              <Input value={newCard.name} onChange={e => setNewCard(c => ({ ...c, name: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1">Description</label>
              <Input value={newCard.description} onChange={e => setNewCard(c => ({ ...c, description: e.target.value }))} />
            </div>
            <div className="mb-2 flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1">Price</label>
                <Input type="number" value={newCard.price} onChange={e => setNewCard(c => ({ ...c, price: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1">Duration</label>
                <Input value={newCard.duration} onChange={e => setNewCard(c => ({ ...c, duration: e.target.value }))} />
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1">Photo URL</label>
              <Input value={newCard.photo} onChange={e => setNewCard(c => ({ ...c, photo: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1">Features</label>
              {newCard.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1 mb-1">
                  <Input
                    value={feature}
                    onChange={e => {
                      const updated = [...newCard.features];
                      updated[idx] = e.target.value;
                      setNewCard(c => ({ ...c, features: updated }));
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setNewCard(c => ({ ...c, features: c.features.filter((_, i) => i !== idx) }))}
                    variant="ghost"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={() => setNewCard(c => ({ ...c, features: [...c.features, ""] }))}
                className="mt-1"
              >
                + Add Feature
              </Button>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddCard(false)}>Cancel</Button>
              <Button onClick={handleAddCard} disabled={!newCard.name || !newCard.price || !newCard.photo}>Add Service</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};