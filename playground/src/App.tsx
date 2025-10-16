import React from "react";
import { Group, Timeline } from "../../src";
import { addDays } from "date-fns";

export function App() {
  return (
    <div style={{ width: "100vw", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "50%" }}>
        <Timeline>
          <Group
            id="1"
            title="Group 1"
            items={[
              {
                start: new Date(),
                end: addDays(new Date(), 25),
                id: 12,
                component: <div>Item 1asdasd</div>,
              },
            ]}
          />
          <Group
            id="2"
            title="Group 2"
            items={[
              {
                start: new Date(),
                end: addDays(new Date(), 25),
                id: 142,
                component: <div>Item 1asdasd</div>,
              },
            ]}
          />
        </Timeline>
      </div>
    </div>
  );
}
