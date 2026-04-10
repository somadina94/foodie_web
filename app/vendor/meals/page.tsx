"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mealService, type Meal } from "@/services/mealService";
import { ApiError } from "@/services/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";

function buildFormData(fields: {
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
  image?: File | null;
}): FormData {
  const fd = new FormData();
  fd.append("name", fields.name.trim());
  fd.append("description", fields.description.trim());
  fd.append("price", fields.price.trim());
  fd.append("isAvailable", String(fields.isAvailable));
  if (fields.image) fd.append("image", fields.image);
  return fd;
}

export default function VendorMealsPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: meals, isLoading, error } = useQuery({
    queryKey: ["vendor-meals"],
    queryFn: async () => {
      const res = await mealService.listMine();
      return res.data.meals;
    },
  });

  const createMut = useMutation({
    mutationFn: (fd: FormData) => mealService.create(fd),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["vendor-meals"] });
      closeDialog();
      toast.success("Meal created");
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : "Could not create meal.";
      setFormError(msg);
      toast.error("Could not create meal", { description: msg });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) => mealService.update(id, fd),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["vendor-meals"] });
      closeDialog();
      toast.success("Meal updated");
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : "Could not update meal.";
      setFormError(msg);
      toast.error("Could not update meal", { description: msg });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => mealService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["vendor-meals"] });
      toast.success("Meal removed");
    },
    onError: (e) =>
      toast.error("Could not delete meal", {
        description: e instanceof ApiError ? e.message : "Try again.",
      }),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) => {
      const fd = new FormData();
      fd.append("isAvailable", String(next));
      return mealService.update(id, fd);
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ["vendor-meals"] });
      toast.success(vars.next ? "Marked available" : "Marked unavailable");
    },
    onError: (e) =>
      toast.error("Could not update availability", {
        description: e instanceof ApiError ? e.message : "Try again.",
      }),
  });

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setPrice("");
    setIsAvailable(true);
    setImageFile(null);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(meal: Meal) {
    setEditing(meal);
    setName(meal.name);
    setDescription(meal.description ?? "");
    setPrice(String(meal.price));
    setIsAvailable(meal.isAvailable);
    setImageFile(null);
    setFormError(null);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setFormError(null);
    setImageFile(null);
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const p = Number(price);
    if (!name.trim() || !Number.isFinite(p) || p < 0) {
      setFormError("Enter a valid name and price.");
      return;
    }
    if (!editing && !imageFile) {
      setFormError("Please choose an image for the new meal.");
      return;
    }
    const fd = buildFormData({
      name,
      description,
      price,
      isAvailable,
      image: imageFile ?? undefined,
    });
    if (editing) {
      updateMut.mutate({ id: editing._id, fd });
    } else {
      createMut.mutate(fd);
    }
  }

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Menu items</h1>
          <p className="text-muted-foreground">
            Add meals with a photo, set price, and control availability for customers.
          </p>
        </div>
        <Button type="button" className="rounded-full" onClick={openCreate}>
          <Plus className="size-4" />
          Add meal
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load meals."}
        </p>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && meals && meals.length === 0 && (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <UtensilsCrossed className="mx-auto size-10 text-muted-foreground" />
            <CardTitle>No meals yet</CardTitle>
            <CardDescription>Create your first dish with a photo and price.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button type="button" variant="outline" className="rounded-full" onClick={openCreate}>
              <Plus className="size-4" />
              Add meal
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && meals && meals.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal, index) => (
            <li key={meal._id} className="flex h-full">
              <Card className="flex w-full flex-col gap-0 overflow-hidden p-0">
                <div className="relative aspect-[4/3] w-full shrink-0 bg-muted">
                  <Image
                    src={meal.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 px-4 py-4">
                  <CardHeader className="gap-2 p-0">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 text-base leading-snug">{meal.name}</CardTitle>
                      <Badge variant={meal.isAvailable ? "default" : "secondary"}>
                        {meal.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {meal.description || "No description"}
                    </CardDescription>
                    <p className="text-lg font-semibold tabular-nums">
                      ${meal.price.toFixed(2)}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 p-0 pt-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={toggleMut.isPending}
                    onClick={() =>
                      toggleMut.mutate({ id: meal._id, next: !meal.isAvailable })
                    }
                  >
                    {meal.isAvailable ? "Mark unavailable" : "Mark available"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => openEdit(meal)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={deleteMut.isPending}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.confirm("Delete this meal?")) {
                        deleteMut.mutate(meal._id);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                  </CardContent>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => (o ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="sm:max-w-lg" showCloseButton>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit meal" : "New meal"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update details or replace the image. Leave image empty to keep the current photo."
                : "Upload one image (JPEG, PNG, WebP, or GIF) up to 5MB."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitForm} className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-name">Name</Label>
              <Input
                id="meal-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-desc">Description</Label>
              <Textarea
                id="meal-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-price">Price (USD)</Label>
              <Input
                id="meal-price"
                required
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="meal-available"
                type="checkbox"
                className="size-4 rounded border-input"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              <Label htmlFor="meal-available" className="font-normal">
                Available on the public menu
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-image">Image {!editing && "(required)"}</Label>
              <Input
                id="meal-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => closeDialog()}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Create meal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
