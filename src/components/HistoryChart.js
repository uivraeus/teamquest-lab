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
    const sample = {
      id,
      date: result.meta.createTime,
      minMaturity: stages.length > 0 ? stages[0] : 0,
      maxMaturity: stages.length > 0 ? stages[stages.length - 1] : 0,
      midMaturity1: stages.length > 2 ? stages[1] : null,
      midMaturity2: stages.length > 3 ? stages[2] : null,
      efficiency: result.efficiency !== null ? result.efficiency : 0
    };
    return sample;
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
  
  const sampleX = background.x + background.width / 2;

  //don't allow too narrow bars (hard to click on) or too wide (looks weird)
  const rectWidth = Math.min(13, Math.max(9, background.width));
  const rectX = sampleX - rectWidth / 2;

  //derive highlight-status
  const fill = selectedId === payload.id ? "var(--color-result-selected)" : (
    hoverId === payload.id ? "var(--color-result-hover)" : "rgba(0,0,0,0)"
  );

  return (
    <rect
      x={rectX}
      y={background.y}
      width={rectWidth}
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
const HistoryChart = ({ results, selectedId = null, updateSelection = (id) => {} }) => {
  //Align plot's right end to the current date. The left corresponds to first sample.
  const [now] = useState(new Date().getTime());
  const oldest = results[0].meta.date;

  const [hoverId, setHoverId] = useState(null)
  const samples = collectSamples(results, hoverId, selectedId);
  
  //Helper component for propagating current state and props to HighlightBar
  const MyBar = (props) => <HighlightBar 
    {...props}
    selectedId={selectedId}
    hoverId={hoverId}
  />

  //Clicks on samples (MyBar) selects a survey instance. Clicks outside clears the
  //selection.
  //The signatures for the recharts callbacks are not well documented, so empirical
  //experiments were used to get these right.
  const onChartClick = () => updateSelection(null)
  const onBarClick = (s, _, e) => {
    e.stopPropagation(); //prevent onChartClick from running afterwards
    updateSelection(s.id)
  }

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
          onClick={onChartClick}
          onMouseLeave={()=>setHoverId(null)} //"plan b" - the bar's mouse-out is lost sometimes (?)
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
            name="Stage"
            stroke="var(--color-result-m)"
            width={20}
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
            opacity="0.5"
            dataKey="midMaturity1"
            fill="var(--color-result-m)"
            legendType="none"
            tooltipType="none"
          />

          <Scatter
            yAxisId="left"
            opacity="0.5"
            dataKey="midMaturity2"
            fill="var(--color-result-m)"
            legendType="none"
            tooltipType="none"
          />

          <Scatter
            yAxisId="left"
            line
            lineJointType="monotoneX"
            opacity="0.5"
            dataKey="maxMaturity"
            fill="var(--color-result-m)"
            strokeWidth={1}
            strokeDasharray="3 3"
            legendType="none"
            tooltipType="none"
          />

          <Scatter
            yAxisId="left"
            name="Matched stage(s)"
            line
            lineJointType="monotoneX"
            dataKey="minMaturity"
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
            onClick={onBarClick}
            onMouseEnter={s => setHoverId(s.id)}
            onMouseOut={() => setHoverId(null)}            
          />
          
        </ComposedChart>
        
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
