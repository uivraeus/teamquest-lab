import analyze from './algorithm';

//Helper for translating to answer range 0-4 (as in db backend)
const dbFormat = (responses) => {
  const transformed = responses.map(response =>
    response.map(v => v - 1)
  );
  return transformed;
}

describe("Analyze responses", () => {
  // test("no input", () => {

  // })

  test("min values", () => {
      const inputResponses = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0]
      ];
      const expAnalysisResult = [0,0,0,0];

      expect(analyze(inputResponses)).toEqual(expAnalysisResult);
  });

  test("max values", () => {
    const inputResponses = [
      [4,4,4,4,4,4,4,4,4,4,4,4,4],
      [4,4,4,4,4,4,4,4,4,4,4,4,4],
      [4,4,4,4,4,4,4,4,4,4,4,4,4]
    ];
    const expAnalysisResult = [100,100,100,100];

    expect(analyze(inputResponses)).toEqual(expAnalysisResult);
  });

  test("additional questions", () => {
    const inputResponses = [
      [4,4,4,4,4,4,4,4,4,4,4,4,4,1,3],
      [4,4,4,4,4,4,4,4,4,4,4,4,4,2,2],
      [4,4,4,4,4,4,4,4,4,4,4,4,4,3,1]
    ];
    const expAnalysisResult = [100,100,100,100];

    expect(analyze(inputResponses)).toEqual(expAnalysisResult);
  });
 
  test("Approx Mean: Dependency and Inclusion", () => {
    //questions 1,5,9 and 13
    //Mean corresponds to avg of 9.65 
    //-> 3x10 + 2x9 -> avg 9.6 -> just below mean (49.07...)
    const inputResponses = dbFormat([
    /* |       |       |       | */
      [1,1,1,1,5,1,1,1,1,1,1,1,3],
      [2,1,1,1,4,1,1,1,3,1,1,1,1],
      [3,1,1,1,3,1,1,1,2,1,1,1,2],
      [4,1,1,1,2,1,1,1,2,1,1,1,1],
      [5,1,1,1,1,1,1,1,1,1,1,1,2]
    ]);
    const expAnalysisResult = [49,0,0,0];
    const result = analyze(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });

  test("Approx 25% Counter-Dependency and Fight", () => {
    //questions 2,6 and 10
    //25% corresponds to avg of 5.92
    //-> 3x5 + 1x8 + 1x7 -> avg 6 -> just above 25% (26.38) 
    const inputResponses = dbFormat([
    /*   |       |       |       */
      [1,1,1,1,1,2,1,1,1,2,1,1,1],
      [1,3,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,1,1,1,1,1,1,1,2,1,1,1],
      [1,4,1,1,1,3,1,1,1,1,1,1,1],
      [1,5,1,1,1,1,1,1,1,1,1,1,1]
    ]);
    const expAnalysisResult = [0,26,0,0];
    const result = analyze(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });

  test("75% Trust and Structure", () => {
    //questions 3,7 and 11
    //75% corresponds to avg of 12.00
    //-> 12 + 13 + 11 + 14 + 10-> avg 12 -> 75% 
    const inputResponses = dbFormat([
    /*     |       |       |     */
      [1,1,5,1,1,1,5,1,1,1,2,1,1],
      [1,1,4,1,1,1,4,1,1,1,5,1,1],
      [1,1,3,1,1,1,4,1,1,1,4,1,1],
      [1,1,5,1,1,1,5,1,1,1,4,1,1],
      [1,1,2,1,1,1,5,1,1,1,3,1,1]
    ]);
    const expAnalysisResult = [0,0,75,0];
    const result = analyze(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });

  test("84% Work and Productivity", () => {
    //questions 4,8 and 12
    //84% corresponds to avg of 13.00
    //-> 13 + 12 + 14 + 11 + 15-> avg 13 -> 84% 
    const inputResponses = dbFormat([
    /*       |       |       |   */
      [1,1,1,4,1,1,1,4,1,1,1,5,1],
      [1,1,1,3,1,1,1,5,1,1,1,4,1],
      [1,1,1,5,1,1,1,4,1,1,1,5,1],
      [1,1,1,4,1,1,1,3,1,1,1,4,1],
      [1,1,1,5,1,1,1,5,1,1,1,5,1]
    ]);
    const expAnalysisResult = [0,0,0,84];
    const result = analyze(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });
  
  test("Approx 16% Work and Productivity", () => {
    //questions 4,8 and 12
    //16% corresponds to avg of 9.93
    //-> 4x10 + 1x9-> avg 9.8 -> just below 16% (15.70) 
    const inputResponses = dbFormat([
    /*       |       |       |   */
      [1,1,1,4,1,1,1,4,1,1,1,2,1],
      [1,1,1,3,1,1,1,2,1,1,1,5,1],
      [1,1,1,2,1,1,1,5,1,1,1,3,1],
      [1,1,1,1,1,1,1,5,1,1,1,4,1],
      [1,1,1,3,1,1,1,3,1,1,1,3,1]
    ]);
    const expAnalysisResult = [0,0,0,16];
    const result = analyze(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });
});

describe("Failed analysis due to invalid input", () => {
  
  test("too few answers", () => {
    //12 instead of 13
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   //wrap in "invoker" function to test exception
   expect(() => analyze(inputResponses)).toThrowError("Unexpected number of responses: 12");
  });

  test("too many answers", () => {
    //14 instead of 13
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   //wrap in "invoker" function to test exception
   expect(() => analyze(inputResponses)).toThrowError("Unexpected number of responses: 14");
  });

  test("invalid answer - out of range", () => {
    //5, not in range 0-4
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,5,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   //wrap in "invoker" function to test exception
   expect(() => analyze(inputResponses)).toThrowError("Unexpected answers: 5");
  });

  test("invalid answer - not a number", () => {
    //null, not in range 0-4
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,null,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   //wrap in "invoker" function to test exception
   expect(() => analyze(inputResponses)).toThrowError("Unexpected answers: ");
  });

});
