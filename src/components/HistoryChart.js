import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  CartesianGrid
} from "recharts";
import { matchedMaturityStages } from "../helpers/algorithm";

import "./HistoryChart.css";

//Helper for splitting the maturity results into separate arrays of date/value
//pairs (matching the rechart API for scatter plots)
//returns arrays of three arrays: [min, mid, max]
const splitMaturity = (results) => {
  const dates = results.map(result => result.meta.createTime);
  const matHistory = results.map(result => matchedMaturityStages(result.maturity));
  const matMin = matHistory.map((matches,index) => ({
    date: dates[index],
    value: matches.length > 0 ? matches[0] : 0
  }));
  const matMax = matHistory.map((matches,index) => ({
    date: dates[index],
    value: matches.length > 0 ? matches[matches.length-1] : 0
  }));
  //Add any stage-matches between min and max to a separate common array (with different length)
  const matMid = matHistory.reduce((acc, matches, index) => {
    if (matches.length === 3) {
      return acc.concat([{
        date: dates[index],
        value: matches[1]
      }])
    } else if(matches.length === 4) {
      return acc.concat([{
        date: dates[index],
        value: matches[1]
      },{
        date: dates[index],
        value: matches[2]
      }])
    } else {
      return acc; //nothing to add
    }
  },[]);

  return [matMin, matMid, matMax];
}

//Input is a list of "result objects" with shape {meta, maturity, efficiency ...})
//Plot different series for:
//- matched maturity stages
//- efficiency (when available)
//NOTE: we don't do any "filtering" on completion level or similar here as
//that is the responsibility of the parent, i.e. just try to plot everything.  
const HistoryChart = ({ results }) => {
  const [matMin, matMid, matMax] = splitMaturity(results);
  
  //Helpers for configuring the x-axis
  const oldest = results[0].meta.date;
  const now = new Date().getTime();

  //TODO: Improve XAxis tick alignment and layout
  //Now I have a ScatterChart with negative left margin to not waste so much space
  //on that side but that also means that the first tick's label is lost
  return (
    <div className="HistoryChart">
      <ResponsiveContainer minWidth={360} minHeight={200}>
        <ScatterChart margin={{ top: 10, right: 0, bottom: 0, left: -27 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            domain={[oldest, now]}
            type="number"
            dataKey="date"
            name="Date"
            ticks={matMin.map(m => m.date)}
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis domain={[0, 4]} dataKey="value" name="Stage" />
          
          <Scatter
            shape="circle"
            opacity="0.5"
            data={matMid}
            fill="var(--color-result-m)"
            strokeWidth={1}
          />
          <Scatter
            line
            lineJointType="monotoneX"
            shape="circle"
            opacity="0.5"
            data={matMax}
            fill="var(--color-result-m)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Scatter
            line
            lineJointType="monotoneX"
            shape="circle"
            data={matMin}
            fill="var(--color-result-m)"
            strokeWidth={2}
          />
          
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
