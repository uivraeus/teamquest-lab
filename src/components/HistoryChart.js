import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Scatter,
  CartesianGrid,
  Legend,
  Bar
} from "recharts";
import { matchedMaturityStages } from "../helpers/algorithm";

import "./HistoryChart.css";

//Create combined samples array, incl metadata, to match how we use the ComposedChart
const collectSamples = (results) => {
  return results.map((result) => {
    const stages = matchedMaturityStages(result.maturity);
    const id=result.meta.id;
    return {
      id,
      date: result.meta.createTime,
      maturity: stages.length > 0 ? stages[0] : 0,
      efficiency: result.efficiency !== null ? Math.round(result.efficiency) : 0      
    } 
  });
};

//Compact format to save space (essential on mobile)
//const dateStringOptions = { year: '2-digit', month: 'short', day: 'numeric' };
const dateStringOptions = { month: "short", day: "numeric" };

// Very similar to the builtin "dot" (or circle) but a smaller radius
const MyDot = (props) => {
  const { cx, cy, fill } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      stroke={fill}
      strokeWidth="1"
      fill={fill}
    />
  );
};

//This helper shape is used for implementing hover, click and selection highlighting
//props correspond to what recharts/Bar's shape override provides (+ selected/hoverId)
const HighlightBar = (props) => {
  const { background, payload, hoverId, selectedId } = props;
  
  //don't allow too narrow bars (hard to click on)
  const width = Math.max(9, background.width);
  const xAdjust = width > background.width ? (width - background.width)/2 : 0;

  //derive highlight-status
  const fill = selectedId === payload.id ? "var(--color-result-selected)" : (
    hoverId === payload.id ? "var(--color-result-hover)" : "rgba(0,0,0,0)"
  );//var(--color-result-hover)

  return (
    <rect
      x={background.x - xAdjust}
      y={background.y}
      width={width}
      height={background.height}
      fill={fill}
    />
  );
};


//Input is a list of "result objects" with shape {meta, maturity, efficiency ...})
//Plot different series for:
//- matched maturity stages
//- efficiency (when available)
//NOTE: we don't do any "filtering" on completion level or similar here as
//that is the responsibility of the parent, i.e. just try to plot everything.
const HistoryChart = ({ results }) => {
  //Align plot's right end to the current date. The left corresponds to first sample.
  const [now] = useState(new Date().getTime());
  const oldest = results[0].meta.date;

  const [selectedId, setSelectedId] = useState(null); //TODO replace with prop and callback
  const [hoverId, setHoverId] = useState(null)
  const samples = collectSamples(results, hoverId, selectedId);
  
  //Helper component for propagating current state and props to HighlightBar
  const MyBar = (props) => <HighlightBar 
    {...props}
    selectedId={selectedId}
    hoverId={hoverId}
  />

  return (
    <div className="HistoryChart">
      <ResponsiveContainer minWidth={360} minHeight={200}>
        <ComposedChart
          data={samples}
          margin={{
            top: 6,
            right: 6,
            bottom: 0,
            left: 0,
          }}
        > 
          <CartesianGrid vertical={false} />

          <XAxis
            domain={[oldest, now]}
            type="number"
            dataKey="date"
            name="Date"
            ticks={samples.map((s) => s.date)}
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString("en-us", dateStringOptions)
            }
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            domain={[0, 4]}
            dataKey="maturity"
            name="Stage"
            stroke="var(--color-result-m)"
            width={20}
            //hide
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            dataKey="efficiency"
            name="Efficiency"
            unit="%"
            stroke="var(--color-result-e)"
            hide
          />
          <Legend iconSize={7} />
          
          <Scatter
            yAxisId="left"
            name="Matched stage(s)"
            line
            lineJointType="monotoneX"
            dataKey="maturity"
            fill="var(--color-result-m)"
            strokeWidth={2}
          />

          <Scatter
            yAxisId="right"
            name="Productivity"
            line
            lineJointType="monotoneX"
            shape={MyDot}
            dataKey="efficiency"
            fill="var(--color-result-e)"
            strokeWidth={2}
          />

          <Bar
            yAxisId="left"
            //dataKey not even used here, the custom shape doesn't use any value anyway
            legendType="none"
            shape={MyBar}
            onClick={s => setSelectedId(s.id)} //TODO: replace with callback to parent
            onMouseEnter={s => setHoverId(s.id)}
            onMouseOut={s => setHoverId(null)}            
          />

          
        </ComposedChart>
        
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
