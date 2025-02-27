import {
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { PropsWithChildren, useCallback } from "react";
import { CellSize, DAY_LABELS } from "./constants.ts";
import { useScheduleContext } from "./ScheduleContext.tsx";

const GRID_OFFSET_X = 120 + 1;
const GRID_OFFSET_Y = 40 + 1;

function createSnapModifier(): Modifier {
  return ({ transform, containerNodeRect, draggingNodeRect }) => {
    const containerTop = containerNodeRect?.top ?? 0;
    const containerLeft = containerNodeRect?.left ?? 0;
    const containerBottom = containerNodeRect?.bottom ?? 0;
    const containerRight = containerNodeRect?.right ?? 0;

    const { top = 0, left = 0, bottom = 0, right = 0 } = draggingNodeRect ?? {};

    const minX = containerLeft - left + GRID_OFFSET_X;
    const minY = containerTop - top + GRID_OFFSET_Y;
    const maxX = containerRight - right;
    const maxY = containerBottom - bottom;

    return {
      ...transform,
      x: Math.min(
        Math.max(
          Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH,
          minX
        ),
        maxX
      ),
      y: Math.min(
        Math.max(
          Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT,
          minY
        ),
        maxY
      ),
    };
  };
}

const modifiers = [createSnapModifier()];

export default function ScheduleDndProvider({ children }: PropsWithChildren) {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const { x, y } = delta;
      const activeId = String(active.id);
      const [tableId, indexStr] = activeId.split(":");
      const index = Number(indexStr);
      const schedule = schedulesMap[tableId][index];
      const nowDayIndex = DAY_LABELS.indexOf(
        schedule.day as (typeof DAY_LABELS)[number]
      );
      const moveDayIndex = Math.floor(x / 80);
      const moveTimeIndex = Math.floor(y / 30);

      setSchedulesMap({
        ...schedulesMap,
        [tableId]: schedulesMap[tableId].map((targetSchedule, targetIndex) => {
          if (targetIndex !== index) {
            return { ...targetSchedule };
          }
          return {
            ...targetSchedule,
            day: DAY_LABELS[nowDayIndex + moveDayIndex],
            range: targetSchedule.range.map((time) => time + moveTimeIndex),
          };
        }),
      });
    },
    [setSchedulesMap]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={modifiers}
    >
      {children}
    </DndContext>
  );
}
