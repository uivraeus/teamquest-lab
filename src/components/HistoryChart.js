import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  CartesianGrid,
  Legend,
} from "recharts";
import { matchedMaturityStages } from "../helpers/algorithm";

import "./HistoryChart.css";

//Helper for splitting the maturity results into separate arrays of date/value
//pairs (matching the rechart API for scatter plots)
//returns arrays of three arrays: [min, min, max]
const splitMaturity = (results) => {
  const dates = results.map((result) => result.meta.createTime);
  const matHistory = results.map((result) =>
    matchedMaturityStages(result.maturity)
  );
  const matMin = matHistory.map((matches, index) => ({
    date: dates[index],
    value: matches.length > 0 ? matches[0] : 0,
  }));
  const matMax = matHistory.map((matches, index) => ({
    date: dates[index],
    value: matches.length > 0 ? matches[matches.length - 1] : 0,
  }));
  //Add any stage-matches between min and max to a separate common array (with different length)
  const matMid = matHistory.reduce((acc, matches, index) => {
    if (matches.length === 3) {
      return acc.concat([
        {
          date: dates[index],
          value: matches[1],
        },
      ]);
    } else if (matches.length === 4) {
      return acc.concat([
        {
          date: dates[index],
          value: matches[1],
        },
        {
          date: dates[index],
          value: matches[2],
        },
      ]);
    } else {
      return acc; //nothing to add
    }
  }, []);

  return [matMin, matMid, matMax];
};

//Helper for collecting efficiency samples. Ideally this should be a simple "map"
//but there may be old survey instances where efficiency wasn't collected
const collectEfficiency = (results) => {
  const firstIx = results.findIndex((result) => !!result.efficiency);
  if (firstIx !== -1) {
    return results.slice(firstIx).map((result) => ({
      date: result.meta.createTime,
      value: result.efficiency || 0,
    }));
  } else {
    return [];
  }
};

//Compact format to save space (essential on mobile)
//const dateStringOptions = { year: '2-digit', month: 'short', day: 'numeric' };
const dateStringOptions = { month: "short", day: "numeric" };

//Helpers for tweaking the scatter's "shape"
// const MyCircle = (props) => {
//   const { cx, cy, fill, strokeWidth } = props;
//   return (
//     <circle
//       cx={cx}
//       cy={cy}
//       r={5}
//       stroke={fill}
//       strokeWidth={strokeWidth}
//       fill="var(--color-bkg-default)"
//     />
//   );
// };

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

//Input is a list of "result objects" with shape {meta, maturity, efficiency ...})
//Plot different series for:
//- matched maturity stages
//- efficiency (when available)
//NOTE: we don't do any "filtering" on completion level or similar here as
//that is the responsibility of the parent, i.e. just try to plot everything.
const HistoryChart = ({ results }) => {
  //Align plot's right end to the current date. The left corresponds to first sample.
  const [now, setNow] = useState(null);
  useEffect(() => setNow(new Date().getTime()), []);
  const oldest = results[0].meta.date;

  const [matMin, matMid, matMax] = splitMaturity(results);
  const effEst = collectEfficiency(results);

  return (
    <div className="HistoryChart">
      <ResponsiveContainer minWidth={360} minHeight={200}>
        <ScatterChart margin= {{top: 6, right: 6, bottom: 0, left: 0}}>
          <CartesianGrid vertical={false} />
          <XAxis
            domain={[oldest, now]}
            type="number"
            dataKey="date"
            name="Date"
            ticks={matMin.map((m) => m.date)}
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString("en-us", dateStringOptions)
            }
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            domain={[0, 4]}
            dataKey="value"
            name="Stage"
            stroke="var(--color-result-m)"
            width={20}
            //hide
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            dataKey="value"
            name="Efficiency"
            unit="%"
            stroke="var(--color-result-e)"
            hide
          />
          <Legend iconSize={7} />
          <Scatter
            yAxisId="left"
            //shape={MyCircle}
            opacity="0.5"
            data={matMid}
            fill="var(--color-result-m)"
            legendType="none"
            tooltipType="none"
          />
          <Scatter
            yAxisId="left"
            line
            lineJointType="monotoneX"
            //shape={MyCircle}
            opacity="0.5"
            data={matMax}
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
            //shape={MyCircle}
            data={matMin}
            fill="var(--color-result-m)"
            strokeWidth={2}
          />

          <Scatter
            yAxisId="right"
            name="Productivity"
            line
            lineJointType="monotoneX"
            shape={MyDot}
            data={effEst}
            fill="var(--color-result-e)"
            strokeWidth={2}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
