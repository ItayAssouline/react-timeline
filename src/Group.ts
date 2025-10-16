import { useEffect, useRef } from "react";
import { useTimelineEssentials } from "./contexts/TimelineEssentials";
import type { DataItem, IdType } from "vis-timeline";

type Item = Pick<DataItem, "start" | "end"> & {
  component: React.ReactNode;
  id: IdType;
};

export const Group = ({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: Item[];
}) => {
  const { groupsDataset, itemsDataset } = useTimelineEssentials();

  const prevItems = useRef<Item[]>([]);

  useEffect(() => {
    groupsDataset.update({
      id,
      title,
      content: title,
    });
    return () => {
      groupsDataset.remove(id);
    };
  }, [groupsDataset, id, title]);

  useEffect(() => {
    // find new items / updated items
    const { itemsToAdd, itemsToUpdate, itemsToDelete } =
      findItemsToAddUpdateDelete(items, prevItems.current);
    itemsDataset.update([
      ...transformItemsToDataItem(itemsToAdd, id),
      ...transformItemsToDataItem(itemsToUpdate, id),
    ]);
    itemsDataset.remove(itemsToDelete.map((item) => item.id));
    prevItems.current = items;
  }, [items]);

  return null;
};

const transformItemsToDataItem = (
  items: Item[],
  groupId: string
): (Omit<DataItem, "content"> & { component: React.ReactNode })[] => {
  return items.map((item) => ({
    ...item,
    group: groupId,
    component: item.component,
  }));
};
function findItemsToAddUpdateDelete<T extends { id: IdType }>(
  newItems: T[],
  prevItems: T[]
): {
  itemsToAdd: T[];
  itemsToUpdate: T[];
  itemsToDelete: T[];
} {
  const itemsToAdd = newItems.filter(
    (item) => !prevItems.some((prevItem) => prevItem.id === item.id)
  );
  const itemsToUpdate = newItems.filter((item) =>
    prevItems.some((prevItem) => prevItem.id === item.id)
  );
  const itemsToDelete = prevItems.filter(
    (prevItem) => !newItems.some((newItem) => newItem.id === prevItem.id)
  );

  return {
    itemsToAdd,
    itemsToUpdate,
    itemsToDelete,
  };
}
