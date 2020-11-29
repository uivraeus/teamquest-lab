/* Implement the algorithm for analyzing the responses of a specific survey run
 * Input: Array (#responders) of array (#questions) of numbers (answers, i.e. 0-4); 
 * Output: Array with four numbers, one for each "category":
 *         [0]: "Dependency and Inclusion",
 *         [1]: "Counter-Dependency and Fight",
 *         [2]: "Trust and Structure",
 *         [3]: "Work and Productivity"
 */

 // ! TEMPORARY alg (TODO: replace with the real deal) !
  
const analyze = (responses) => {
  const nQ = 13; // expected number of questions
  const nV = 5;  // number of answer options (0-4)
  
  let allSum = [0,0,0,0];
  
  responses.forEach(r => {
    if (nQ !== r.length) {
      throw new Error("Unexpected number of responses: " + r.length);
    }

    let catSum = [0,0,0,0];
    r.forEach((v, i) => {
      if (v >= nV) {
        throw new Error("Unexpected answers: " + v);
      }
      // very temporary "algorithm" ...
      const cat = i % catSum.length;
      catSum[cat] += v;
    });

    catSum.forEach((v, i) => {
      allSum[i] += v;
    });    
  });
  
  const results = allSum.map(v => 1 + v % 10); // results in range 1-10 (TODO/TBD)

  return results;  
}

export default analyze;