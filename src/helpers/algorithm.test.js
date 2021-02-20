import analyze from './algorithm';

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
  
  test("50% Dependency and Inclusion", () => {
    //questions 1,5,9 and 13
    const inputResponses = [
      [0,0,0,0,4,0,0,0,1,0,0,0,2],
      [1,0,0,0,3,0,0,0,3,0,0,0,2],
      [2,0,0,0,2,0,0,0,2,0,0,0,2],
      [3,0,0,0,1,0,0,0,1,0,0,0,2],
      [4,0,0,0,0,0,0,0,3,0,0,0,2]
    ];
    const expAnalysisResult = [50,0,0,0];

    expect(analyze(inputResponses)).toEqual(expAnalysisResult);
  });

  test("50% Counter-Dependency and Fight", () => {
    //questions 2,6 and 10
    const inputResponses = [
      [0,0,0,0,0,4,0,0,0,1,0,0,0],
      [0,1,0,0,0,3,0,0,0,3,0,0,0],
      [0,2,0,0,0,2,0,0,0,2,0,0,0],
      [0,3,0,0,0,1,0,0,0,1,0,0,0],
      [0,4,0,0,0,0,0,0,0,3,0,0,0]
    ];
    const expAnalysisResult = [0,50,0,0];

    expect(analyze(inputResponses)).toEqual(expAnalysisResult);
  });

  test("50% Trust and Structure", () => {
    //questions 3,7 and 11
    const inputResponses = [
      [0,0,0,0,0,0,4,0,0,0,1,0,0],
      [0,0,1,0,0,0,3,0,0,0,3,0,0],
      [0,0,2,0,0,0,2,0,0,0,2,0,0],
      [0,0,3,0,0,0,1,0,0,0,1,0,0],
      [0,0,4,0,0,0,0,0,0,0,3,0,0]
    ];
    const expAnalysisResult = [0,0,50,0];

    expect(analyze(inputResponses)).toEqual(expAnalysisResult);
  });

  test("50% Work and Productivity", () => {
    //questions 4,8 and 12
    const inputResponses = [
      [0,0,0,0,0,0,0,4,0,0,0,1,0],
      [0,0,0,1,0,0,0,3,0,0,0,3,0],
      [0,0,0,2,0,0,0,2,0,0,0,2,0],
      [0,0,0,3,0,0,0,1,0,0,0,1,0],
      [0,0,0,4,0,0,0,0,0,0,0,3,0]
    ];
    const expAnalysisResult = [0,0,0,50];

    expect(analyze(inputResponses)).toEqual(expAnalysisResult);
  });

  //TODO: Add test cases with focus on each result category
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
