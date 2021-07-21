/* Helper functions for managing slices of responses to feed different algorithms
 */

/* What kind of analysis processing that is applicable for a set of responses
 */
const ProcType = {
  M13    : 0,         /* 13 maturity questions */
  M13_E3 : 1          /* M13 followed by 3 efficiency questions */ 
};

/* LU-table with slice-ranges for each processing type in the overall response array 
 * [start, end]
 */
const RespSlices = [
  { maturity: [ 0, 13], efficiency: null },                /* M13 */
  { maturity: [ 0, 13], efficiency: [13, 16] }             /* M13_E3 */
];


/* Identify response processing type for a specific survey instance
 * (will throw if no type can be determined)
 */
const getProcType = (survey) => {
  //For now; very simple strategy:
  // - At least 16 questions -> M13_E3
  // - Otherwise             -> M13
  //TBD: add support for "semantic" questionsId or other explicit way of
  //identifying the type.
  try {
    let procType = ProcType.M13; // default
    if (survey.respHandle.responses[0].length >= 16) {
      procType = ProcType.M13_E3;
    }
    return procType;

  } catch(e) {
    const msg = "Error during processing type detection";
    console.log(msg,":", e.message);
    throw new Error(msg);
  }
} 

/* Split common responses into slices for each processing type
 * (null is used for types that are not covered by the survey)
 */ 
const splitResponses = (survey) => {
  try {
    const rs = survey.respHandle.responses;
    const s = RespSlices[getProcType(survey)];
    const slicedResponses = {
      maturity: !s.maturity ? null : rs.map(r => r.slice(...s.maturity)),
      efficiency: !s.efficiency ? null : rs.map(r => r.slice(...s.efficiency))
    };
    return slicedResponses;

  } catch(e) {
    const msg = "Failed to split responses for further processing: " + e.message;
    console.log(msg);
    throw new Error(msg);
  } 
}

/* Common verify function (not alg.-specific)
 * Will throw if there are errors
 */
const verifyInput = (responses) => {
  const nV = 5;  // number of answer options (0-4)

  if (responses.length === 0) {
    throw new Error("Empty response input");
  }
  const nQ = responses[0].length; // equal number of questions expected in all responses

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

export { splitResponses, verifyInput };