"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Check, X, MessageCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ApiKOL } from "@/lib/lark-api";

interface KOLContactEditorProps {
  kol: ApiKOL;
  onSave?: (updated: Partial<ApiKOL["contact"]>) => void;
}

export function KOLContactEditor({ kol, onSave }: KOLContactEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [contact, setContact] = useState({
    lineId: kol.contact?.lineId || "",
    phone: kol.contact?.phone || "",
    email: kol.contact?.email || "",
  });

  const handleSave = () => {
    onSave?.(contact);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContact({
      lineId: kol.contact?.lineId || "",
      phone: kol.contact?.phone || "",
      email: kol.contact?.email || "",
    });
    setIsEditing(false);
  };

  // Inline edit mode (compact)
  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-2 p-3 rounded-xl bg-muted/50 border"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Edit Contact</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
              <X className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-green-600"
              onClick={handleSave}
            >
              <Check className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5 text-[#06C755]" />
            <Input
              value={contact.lineId}
              onChange={(e) => setContact({ ...contact, lineId: e.target.value })}
              placeholder="LINE ID (@username)"
              className="h-7 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-blue-500" />
            <Input
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="Phone number"
              className="h-7 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-orange-500" />
            <Input
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder="Email address"
              className="h-7 text-xs"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Display mode with edit button
  return (
    <div className="relative group">
      <KOLContactDisplay contact={contact} onEdit={() => setIsEditing(true)} />

      {/* Edit button - appears on hover */}
      <motion.button
        initial={{ opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsEditing(true)}
        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        title="Edit contact info"
      >
        <Edit2 className="w-3 h-3" />
      </motion.button>
    </div>
  );
}

// Display component
function KOLContactDisplay({
  contact,
  onEdit,
}: {
  contact: { lineId?: string; phone?: string; email?: string };
  onEdit: () => void;
}) {
  const hasContact = contact.lineId?.trim() || contact.phone?.trim() || contact.email?.trim();

  if (!hasContact) {
    return (
      <div className="relative group">
        <div className="flex items-center justify-center py-2 px-3 rounded-lg bg-muted/30 text-[10px] text-muted-foreground">
          No contact info available
        </div>
        {/* Edit button - appears on hover */}
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          onClick={onEdit}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          title="Add contact info"
        >
          <Edit2 className="w-3 h-3" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {contact.lineId?.trim() && (
        <ContactPill
          href={`https://line.me/ti/p/~${contact.lineId.replace(/^@/, "").trim()}`}
          icon={<MessageCircle className="w-3 h-3" />}
          label={contact.lineId}
          color="#06C755"
        />
      )}
      {contact.phone?.trim() && (
        <ContactPill
          href={`tel:${contact.phone.replace(/\s/g, "")}`}
          icon={<Phone className="w-3 h-3" />}
          label={contact.phone}
          color="#3b82f6"
        />
      )}
      {contact.email?.trim() && (
        <ContactPill
          href={`mailto:${contact.email}`}
          icon={<Mail className="w-3 h-3" />}
          label={contact.email}
          color="#f97316"
        />
      )}
    </div>
  );
}

function ContactPill({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all bg-opacity-10 hover:bg-opacity-20"
      style={{
        color,
        backgroundColor: `${color}20`,
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline max-w-[80px] truncate">{label}</span>
      <span className="sm:hidden">{label.length > 8 ? label.slice(0, 6) + "..." : label}</span>
    </motion.a>
  );
}
