import { analyzeEfficiency} from './algorithm';

describe("Analyze efficiency estimation", () => {
  test("minimal result", () => {
      const inputResponses = [
        [0,4,0],
        [0,4,0],
        [0,4,0]
      ];
      const expAnalysisResult = 0;

      expect(analyzeEfficiency(inputResponses)).toEqual(expAnalysisResult);
  });

  test("maximal result", () => {
    const inputResponses = [
      [4,0,4],
      [4,0,4],
      [4,0,4]
    ];
    const expAnalysisResult = 100;

    expect(analyzeEfficiency(inputResponses)).toEqual(expAnalysisResult);
  });

  test("50% efficiency", () => {
    const inputResponses = [
      [2,2,2],
      [3,3,3],
      [1,1,1]
    ];
    const expAnalysisResult = 50;

    expect(analyzeEfficiency(inputResponses)).toEqual(expAnalysisResult);
  });

  test("75% efficiency", () => {
    const inputResponses = [
      [4,0,4],
      [4,0,4],
      [2,2,2],
      [1,2,3]
    ];
    const expAnalysisResult = 75;

    expect(analyzeEfficiency(inputResponses)).toEqual(expAnalysisResult);
  });
});


describe("Failed efficiency estimation due to invalid input", () => {
  test("too few answers", () => {
    //2 instead of 3
    const inputResponses = [
    [0,0],
    [0,0],
    [0,0]
   ];
   
   expect(() => analyzeEfficiency(inputResponses)).toThrowError("Unexpected number of responses for efficiency estimation: 2");
  });

  test("too few answers", () => {
    //4 instead of 3
    const inputResponses = [
    [0,0,0,0],
    [0,0,0,0]
   ];
   
   expect(() => analyzeEfficiency(inputResponses)).toThrowError("Unexpected number of responses for efficiency estimation: 4");
  });

});
