import { createContext, useContext } from "react";
import { Timeline as VisTimeline } from "vis-timeline/standalone";
import { DataSet } from "vis-data";

interface TimelineEssentials {
  itemsDataset: DataSet<any>;
  groupsDataset: DataSet<any>;
}

const TimelineEssentialsContext = createContext<TimelineEssentials | null>(
  null
);

export const useTimelineEssentials = () => {
  const context = useContext(TimelineEssentialsContext);
  if (!context) {
    throw new Error(
      "useTimelineEssentials must be used within a TimelineEssentialsProvider"
    );
  }
  return context;
};

export { TimelineEssentialsContext };
