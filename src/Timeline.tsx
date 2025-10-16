import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import {
  type DataGroup,
  type DataItem,
  type IdType,
  Timeline as VisTimeline,
} from "vis-timeline/standalone";
import { DataSet } from "vis-data";

import styles from "./timelineProvider.module.scss";
import { addDays } from "date-fns";
import "vis-timeline/styles/vis-timeline-graph2d.css";
import { TimelineEssentialsContext } from "./contexts/TimelineEssentials";
import { createPortal } from "react-dom";

export const Timeline: React.FC<PropsWithChildren> = ({ children }) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const itemsDataset = useRef(new DataSet<DataItem>());
  const groupsDataset = useRef(new DataSet<DataGroup>());

  const [hosts, setHosts] = useState<Map<IdType, HTMLElement>>(new Map());

  const [actualItems, setActualItems] = useState<
    (DataItem & { component: React.ReactNode })[]
  >([]);

  const registerHost = useCallback((id: IdType, el: HTMLElement) => {
    // Avoid churn if same element
    setHosts((prev) => {
      const existing = prev.get(id);
      if (existing === el) return prev;
      const next = new Map(prev);
      next.set(id, el);
      return next;
    });
  }, []);

  const unregisterHost = useCallback((ids: IdType[]) => {
    setHosts((prev) => {
      if (!ids.some((id) => prev.has(id))) return prev;
      const next = new Map(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    if (!timelineRef.current) {
      return;
    }

    const timeline = new VisTimeline(
      timelineRef.current,
      itemsDataset.current,
      groupsDataset.current,
      {
        template: (
          item: DataItem & { component: React.ReactNode; id: IdType },
          element: HTMLDivElement,
          data: DataItem
        ) => {
          // Always create a fresh host element for React to portal into
          const host = document.createElement("div");
          host.className = "react-vis-item-ahusharmuta";
          host.dataset.id = String(item.id);

          element.appendChild(host);
          // Tell React to render into this host
          registerHost(item.id, host);

          // Return the host — vis will append it safely
          return host;
        },
      }
    );

    itemsDataset.current.on("*", (props) => {
      setActualItems(itemsDataset.current.get() ?? []);
    });

    itemsDataset.current.on("remove", (_, props) => {
      unregisterHost(props?.items ?? []);
    });

    return () => {
      if (timeline) {
        unregisterHost(Array.from(hosts.keys())); // drop any leftovers
        timeline.destroy();
      }
    };
  }, []);

  useEffect(() => {
    console.log("Actual items", actualItems);
  }, [actualItems]);

  return (
    <TimelineEssentialsContext.Provider
      value={{
        itemsDataset: itemsDataset.current,
        groupsDataset: groupsDataset.current,
      }}
    >
      <div ref={timelineRef} className={styles.timeline}>
        {children}

        {/* <button
          onClick={() => {
            itemsDataset.current.add({
              title: "Item 1",
              id: 10,
              content: "Item 1",
              start: new Date(),
              end: addDays(new Date(), 30),
            });
          }}
        >
          click
        </button> */}
        {actualItems.map((item) => {
          if (!item.id || !hosts.has(item.id)) {
            console.error("No host or component", item);
            return null;
          }
          const host = hosts.get(item.id);
          if (!host || !item.component) {
            console.error("No host or component", item);
            return null;
          }

          console.log("Rendering component", item, hosts.get(item.id));
          return createPortal(<>{item.component}</>, host, String(item.id));
        })}
      </div>
    </TimelineEssentialsContext.Provider>
  );
};
