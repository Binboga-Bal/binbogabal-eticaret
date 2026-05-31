"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { ConditionCard } from "./ConditionCard";
import { ActionCard } from "./ActionCard";
import type { ConditionItem, ActionItem } from "./CampaignBuilder";
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
) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const activeData = active.data.current as { source?: string } | undefined;
  if (activeData?.source === "panel") return;

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

export function BuilderCanvas({ conditions, actions, onConditionsChange, onActionsChange }: Props) {
  function updateCondition(id: string, patch: Partial<ConditionItem>) {
    onConditionsChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeCondition(id: string) {
    onConditionsChange(conditions.filter((c) => c.id !== id));
  }

  function updateAction(id: string, patch: Partial<ActionItem>) {
    onActionsChange(actions.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function removeAction(id: string) {
    onActionsChange(actions.filter((a) => a.id !== id));
  }

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
          <div className="p-3 space-y-2 min-h-32">
            <SortableContext items={conditions.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {conditions.map((cond) => (
                <ConditionCard
                  key={cond.id}
                  item={cond}
                  onUpdate={(patch) => updateCondition(cond.id, patch)}
                  onRemove={() => removeCondition(cond.id)}
                  onGroupChange={(g) => updateCondition(cond.id, { logicGroup: g })}
                />
              ))}
            </SortableContext>
            {conditions.length === 0 && (
              <div className="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-blue-100 rounded-xl">
                Sol panelden koşul sürükle ya da tıkla
              </div>
            )}
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
          <div className="px-4 py-3 border-b bg-green-50/50 flex items-center gap-2">
            <Zap size={14} className="text-green-600" />
            <span className="text-xs font-bold text-green-800 uppercase tracking-wide">
              Aksiyonlar ({actions.length})
            </span>
          </div>
          <div className="p-3 space-y-2 min-h-32">
            <SortableContext items={actions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              {actions.map((act) => (
                <ActionCard
                  key={act.id}
                  item={act}
                  onUpdate={(patch) => updateAction(act.id, patch)}
                  onRemove={() => removeAction(act.id)}
                />
              ))}
            </SortableContext>
            {actions.length === 0 && (
              <div className="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-green-100 rounded-xl">
                Sol panelden aksiyon sürükle ya da tıkla
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
