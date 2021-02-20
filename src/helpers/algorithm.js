/* Implement the algorithm for analyzing the responses of a specific survey run
 * Input: Array (#responders) of array (#questions) of numbers (answers, i.e. 0-4); 
 * Output: Array with four numbers, one for each "category":
 *         [0]: "Dependency and Inclusion" ,
 *         [1]: "Counter-Dependency and Fight",
 *         [2]: "Trust and Structure",
 *         [3]: "Work and Productivity"
 */

  //Will throw if there are errors
const verifyInput = (responses) => {
  const nQ = 13; // expected number of questions
  const nV = 5;  // number of answer options (0-4)

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

  //return sumAll / (responses.length * qIxArray.length) //TBD: why not this one?
  return sumAll / (responses.length)
} 
  
    
//Helper for "normalizing" the averaged results (-> range 0-100)
//TODO: replace with something non-linear
const normAvg = (avg, min, max) => {
  //assume sane data here, i.e. no checks <min or >max
  return Math.round( 100 * (avg - min) / (max - min) );
}

const analyze = (responses) => {
  verifyInput(responses); //will throw if there are errors
  
  //[0]: "Dependency and Inclusion" (questions 1, 5, 9 and 13)
  const r0 = normAvg(avgSumQ(responses, [0,4,8,12]), 4, 20); 

  //[1]: "Counter-Dependency and Fight" (questions 2,6 and 10)
  const r1 = normAvg(avgSumQ(responses, [1,5,9]), 3, 15); 

  //[2]: "Trust and Structure" (questions 3,7 and 11)
  const r2 = normAvg(avgSumQ(responses, [2,6,10]), 3, 15); 

  //[3]: "Work and Productivity" (questions 4,8,12)
  const r3 = normAvg(avgSumQ(responses, [3,7,11]), 3, 15); 

  return [r0, r1, r2, r3];  
}

export default analyze;