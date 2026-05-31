"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { ConditionCard } from "./ConditionCard";
import { ActionCard } from "./ActionCard";
import type { ConditionItem, ActionItem } from "./CampaignBuilder";
import type { ConditionType, ActionType } from "@prisma/client";
import { Layers, Zap } from "lucide-react";

interface Props {
  conditions: ConditionItem[];
  actions: ActionItem[];
  onConditionsChange: (c: ConditionItem[]) => void;
  onActionsChange: (a: ActionItem[]) => void;
}

export function handleCanvasDragEnd(
  event: DragEndEvent,
  conditions: ConditionItem[],
  actions: ActionItem[],
  onConditionsChange: (c: ConditionItem[]) => void,
  onActionsChange: (a: ActionItem[]) => void,
  addCondition: (type: ConditionType) => void,
  addAction: (type: ActionType) => void,
) {
  const { active, over } = event;
  if (!over) return;

  const activeData = active.data.current as {
    source?: string;
    conditionType?: ConditionType;
    actionType?: ActionType;
  } | undefined;

  // Panel'den canvas'a sürükleme
  if (activeData?.source === "panel") {
    const overId = String(over.id);
    if (activeData.conditionType && (overId === "conditions-drop" || conditions.some((c) => c.id === overId))) {
      addCondition(activeData.conditionType);
    } else if (activeData.actionType && (overId === "actions-drop" || actions.some((a) => a.id === overId))) {
      addAction(activeData.actionType);
    }
    return;
  }

  // Canvas içi sıralama
  if (active.id === over.id) return;

  const activeId = String(active.id);
  const overId = String(over.id);

  const condIdx = conditions.findIndex((c) => c.id === activeId);
  const actIdx = actions.findIndex((a) => a.id === activeId);

  if (condIdx !== -1) {
    const overIdx = conditions.findIndex((c) => c.id === overId);
    if (overIdx !== -1) {
      onConditionsChange(arrayMove(conditions, condIdx, overIdx).map((c, i) => ({ ...c, sortOrder: i })));
    }
  } else if (actIdx !== -1) {
    const overIdx = actions.findIndex((a) => a.id === overId);
    if (overIdx !== -1) {
      onActionsChange(arrayMove(actions, actIdx, overIdx).map((a, i) => ({ ...a, sortOrder: i })));
    }
  }
}

function ConditionsDropZone({ conditions, onConditionsChange, onConditionGroupChange, onConditionRemove }: {
  conditions: ConditionItem[];
  onConditionsChange: (c: ConditionItem[]) => void;
  onConditionGroupChange: (id: string, g: number) => void;
  onConditionRemove: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "conditions-drop" });
  return (
    <div
      ref={setNodeRef}
      className={`p-3 space-y-2 min-h-32 transition-colors ${isOver ? "bg-blue-50" : ""}`}
    >
      <SortableContext items={conditions.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {conditions.map((cond) => (
          <ConditionCard
            key={cond.id}
            item={cond}
            onUpdate={(patch) => onConditionsChange(conditions.map((c) => (c.id === cond.id ? { ...c, ...patch } : c)))}
            onRemove={() => onConditionRemove(cond.id)}
            onGroupChange={(g) => onConditionGroupChange(cond.id, g)}
          />
        ))}
      </SortableContext>
      {conditions.length === 0 && (
        <div className={`text-center py-6 text-xs border-2 border-dashed rounded-xl transition-colors ${isOver ? "border-blue-400 text-blue-500 bg-blue-50" : "border-blue-100 text-gray-400"}`}>
          Sol panelden koşul sürükle ya da tıkla
        </div>
      )}
    </div>
  );
}

function ActionsDropZone({ actions, onActionsChange, onActionRemove }: {
  actions: ActionItem[];
  onActionsChange: (a: ActionItem[]) => void;
  onActionRemove: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "actions-drop" });
  return (
    <div
      ref={setNodeRef}
      className={`p-3 space-y-2 min-h-32 transition-colors ${isOver ? "bg-green-50" : ""}`}
    >
      <SortableContext items={actions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        {actions.map((act) => (
          <ActionCard
            key={act.id}
            item={act}
            onUpdate={(patch) => onActionsChange(actions.map((a) => (a.id === act.id ? { ...a, ...patch } : a)))}
            onRemove={() => onActionRemove(act.id)}
          />
        ))}
      </SortableContext>
      {actions.length === 0 && (
        <div className={`text-center py-6 text-xs border-2 border-dashed rounded-xl transition-colors ${isOver ? "border-green-400 text-green-500 bg-green-50" : "border-green-100 text-gray-400"}`}>
          Sol panelden aksiyon sürükle ya da tıkla
        </div>
      )}
    </div>
  );
}

export function BuilderCanvas({ conditions, actions, onConditionsChange, onActionsChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Koşullar */}
      <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden">
        <div className="px-4 py-3 border-b bg-blue-50/50 flex items-center gap-2">
          <Layers size={14} className="text-blue-600" />
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
            Koşullar ({conditions.length})
          </span>
        </div>
        <ConditionsDropZone
          conditions={conditions}
          onConditionsChange={onConditionsChange}
          onConditionGroupChange={(id, g) => onConditionsChange(conditions.map((c) => (c.id === id ? { ...c, logicGroup: g } : c)))}
          onConditionRemove={(id) => onConditionsChange(conditions.filter((c) => c.id !== id))}
        />
      </div>

      {/* Aksiyonlar */}
      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        <div className="px-4 py-3 border-b bg-green-50/50 flex items-center gap-2">
          <Zap size={14} className="text-green-600" />
          <span className="text-xs font-bold text-green-800 uppercase tracking-wide">
            Aksiyonlar ({actions.length})
          </span>
        </div>
        <ActionsDropZone
          actions={actions}
          onActionsChange={onActionsChange}
          onActionRemove={(id) => onActionsChange(actions.filter((a) => a.id !== id))}
        />
      </div>
    </div>
  );
}
