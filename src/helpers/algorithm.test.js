import analyze from './algorithm';

describe("Analyze responses", () => {
  // test("no input", () => {

  // })

  test("handle all possible answer options", () => {
    const inputResponses = [
      [0,1,2,3,4,0,1,2,3,4,0,1,2],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [4,4,4,4,4,4,4,4,4,4,4,4,4]
    ];
    const expAnalysisResult = [6,8,6,9];

    expect(analyze(inputResponses)).toEqual(expAnalysisResult);
  })

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
