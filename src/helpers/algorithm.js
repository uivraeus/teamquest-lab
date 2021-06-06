/* Implement the algorithm for analyzing the responses of a specific survey run
 * Input: Array (#responders) of array (#questions) of numbers (answers, i.e. 0-4); 
 *        Note on #questions:
 *        13 questions are used in this implementation. But, the app also allows
 *        for additional questions which are not related to this algorithm.
 *        These additional answers are located from index [13] and upward. 
 * 
 * Output: Array with four results in the range [0-100], one for each "category":
 *         [0]: "Dependency and Inclusion" ,
 *         [1]: "Counter-Dependency and Fight",
 *         [2]: "Trust and Structure",
 *         [3]: "Work and Productivity"
 */

  //Will throw if there are errors
const verifyInput = (responses) => {
  const nV = 5;  // number of answer options (0-4)

  if (responses.length === 0) {
    throw new Error("Empty response input");
  }
  const nQ = responses[0].length; // equal number of questions expected in all responses
  if (nQ < 13) {
    throw new Error("Unexpected number of responses: " + nQ);
  }

  responses.forEach(r => {
    if (nQ !== r.length) {
      throw new Error("Unexpected number of responses: " + r.length);
    }

    r.forEach((v, i) => {
      if (!Number.isInteger(v) || v >= nV) {
        throw new Error("Unexpected answers: " + v);
      }
    });    
  });
}

//Helper for summing specific questions for each responder
//- specified question-indexes and answers are zero-based (!)
//- but the answers are summed with +1 (treated as range 1-5)
const avgSumQ = (responses, qIxArray) => {
  const sumAll = responses.reduce((totAcc, resp) => 
    totAcc + qIxArray.reduce((acc, ix) =>
      acc + (1 + resp[ix]),
      0),
    0);

  return sumAll / responses.length
} 
  
    
//Helper for computing a value's ratio within an interval
//ratio range [0-1], 0==range min, 1==range max 
const rangeRatio = (val, min, max) => {
  //assume sane data here, i.e. no checks <min or >max
  return (val - min) / (max - min);
}

//The normalization is simplified by linear interpolation within
//a specific percentile interval, with different values for
//different categories (based on study results from 2.5K+ teams)
//The array order is: [min, 16th, 25th, mean, 75th, 84th, max]
const indexValues = [0, 16, 25, 50, 75, 84, 100];
const interval0 = [ 4.00,  7.80,  8.30,  9.65, 11.00, 11.61, 20.00];
const interval1 = [ 3.00,  5.29,  5.92,  7.37,  8.75,  9.60, 15.00];
const interval2 = [ 3.00,  8.83,  9.50, 10.65, 12.00, 12.57, 15.00];
const interval3 = [ 3.00,  9.93, 10.50, 11.34, 12.50, 13.00, 15.00];


//Helper for determining the applicable interval index for a value
//- interval must an sorted array
const getMinIndex = (value, interval) => {
  return interval.reduce((ix, v,i) => value > v ? i : ix, 0);
}

//Helper for computing the interpolated percentile from a result value (average)
//Return rounded values in range [0-100] (0 decimals)
const computePercentile = (value, interval) => {
  const minIx = getMinIndex(value, interval);
  const min = interval[minIx];
  const max = interval[minIx+1];
  const intervalBase = indexValues[minIx];
  const intervalLength = indexValues[minIx + 1] - intervalBase;
  return Math.round(intervalBase + rangeRatio(value, min, max) * intervalLength);
}

const analyze = (responses) => {
  verifyInput(responses); //will throw if there are errors
  
  //[0]: "Dependency and Inclusion" (questions 1, 5, 9 and 13)
  const r0 = computePercentile(avgSumQ(responses, [0,4,8,12]), interval0);
  
  //[1]: "Counter-Dependency and Fight" (questions 2,6 and 10)
  const r1 = computePercentile(avgSumQ(responses, [1,5,9]), interval1);

  //[2]: "Trust and Structure" (questions 3,7 and 11)
  const r2 = computePercentile(avgSumQ(responses, [2,6,10]), interval2);

  //[3]: "Work and Productivity" (questions 4,8,12)
  const r3 = computePercentile(avgSumQ(responses, [3,7,11]), interval3);

  return [r0, r1, r2, r3];  
}

export default analyze;