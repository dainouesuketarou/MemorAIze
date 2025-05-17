import { Edit2 } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { DeckEditForm } from "../decks/deck-edit-form";

interface DashboardHeaderProps {
  heading: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  description,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-wide md:text-3xl">
          {heading}
        </h1>
        {description && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}