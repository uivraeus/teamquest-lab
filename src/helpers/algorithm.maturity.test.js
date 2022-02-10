import { analyzeMaturity} from './algorithm';

//Helper for translating to answer range 0-4 (as in db backend)
const dbFormat = (responses) => {
  const transformed = responses.map(response =>
    response.map(v => v - 1)
  );
  return transformed;
}

describe("Analyze maturity matching", () => {
  test("min values", () => {
      const inputResponses = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0]
      ];
      const expAnalysisResult = [0,0,0,0];

      expect(analyzeMaturity(inputResponses)).toEqual(expAnalysisResult);
  });

  test("max values", () => {
    const inputResponses = [
      [4,4,4,4,4,4,4,4,4,4,4,4,4],
      [4,4,4,4,4,4,4,4,4,4,4,4,4],
      [4,4,4,4,4,4,4,4,4,4,4,4,4]
    ];
    const expAnalysisResult = [100,100,100,100];

    expect(analyzeMaturity(inputResponses)).toEqual(expAnalysisResult);
  });

  test("Just above Mean: Dependency and Inclusion", () => {
    //questions 1,5,9 and 13
    //Mean corresponds to avg of 9.878 
    //-> 4x11 + 1x7 -> avg 10.2 -> { 4.93 = 25*0.322/(11.511-9.878) } -> 55% (rounded)
    const inputResponses = dbFormat([
    /* |       |       |       | */
      [1,1,1,1,5,1,1,1,2,1,1,1,3],
      [2,1,1,1,4,1,1,1,4,1,1,1,1],
      [3,1,1,1,3,1,1,1,3,1,1,1,2],
      [4,1,1,1,2,1,1,1,4,1,1,1,1],
      [4,1,1,1,1,1,1,1,1,1,1,1,1]
    ]);
    const expAnalysisResult = [55,0,0,0];
    const result = analyzeMaturity(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });

  test("Just below 25%: Counter-Dependency and Fight", () => {
    //questions 2,6 and 10
    //25% corresponds to avg of 5.486
    //-> 3x6 + 1x5 + 1x4 -> avg 5.40 -> { 5.72 = 9*0.15/(5.486-5.250) } -> 21.72% = 22% (rounded)
    const inputResponses = dbFormat([
    /*   |       |       |       */
      [1,1,1,1,1,2,1,1,1,3,1,1,1],
      [1,3,1,1,1,1,1,1,1,2,1,1,1],
      [1,2,1,1,1,3,1,1,1,1,1,1,1],
      [1,1,1,1,1,2,1,1,1,2,1,1,1],
      [1,2,1,1,1,1,1,1,1,1,1,1,1]
    ]);
    const expAnalysisResult = [0,22,0,0];
    const result = analyzeMaturity(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });

  test("A bit below 75%: Trust and Structure", () => {
    //questions 3,7 and 11
    //75% corresponds to avg of 13.762
    //-> 13 + 14 + 14 + 15 + 12-> avg 13.6 -> { 21.18 = 25*0.898/(13.762-12.702) } -> 71.18% (71 rounded)
    const inputResponses = dbFormat([
    /*     |       |       |     */
      [1,1,5,1,1,1,5,1,1,1,3,1,1],
      [1,1,4,1,1,1,5,1,1,1,5,1,1],
      [1,1,5,1,1,1,4,1,1,1,5,1,1],
      [1,1,5,1,1,1,5,1,1,1,5,1,1],
      [1,1,4,1,1,1,5,1,1,1,3,1,1]
    ]);
    const expAnalysisResult = [0,0,71,0];
    const result = analyzeMaturity(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });

  test("A bit above 84%: Work and Productivity", () => {
    //questions 4,8 and 12
    //84% corresponds to avg of 13.723
    //-> 15 + 14 + 15 + 13 + 13-> avg 14 -> { 3.47 = 16*0.277/(15-13.723) } -> 87.47% (87 rounded)
    const inputResponses = dbFormat([
    /*       |       |       |   */
      [1,1,1,5,1,1,1,5,1,1,1,5,1],
      [1,1,1,4,1,1,1,5,1,1,1,5,1],
      [1,1,1,5,1,1,1,5,1,1,1,5,1],
      [1,1,1,3,1,1,1,5,1,1,1,5,1],
      [1,1,1,4,1,1,1,5,1,1,1,4,1]
    ]);
    const expAnalysisResult = [0,0,0,87];
    const result = analyzeMaturity(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });
  
  test("Just below 16% Work and Productivity", () => {
    //questions 4,8 and 12
    //16% corresponds to avg of 11.160
    //-> 4x11 + 1x9-> avg 10.6 -> { 14.9 = 16*7.6/(11.160-3) } -> 14.9% (15 rounded) 
    const inputResponses = dbFormat([
    /*       |       |       |   */
      [1,1,1,4,1,1,1,4,1,1,1,3,1],
      [1,1,1,3,1,1,1,3,1,1,1,5,1],
      [1,1,1,2,1,1,1,5,1,1,1,4,1],
      [1,1,1,1,1,1,1,5,1,1,1,5,1],
      [1,1,1,3,1,1,1,3,1,1,1,3,1]
    ]);
    const expAnalysisResult = [0,0,0,15];
    const result = analyzeMaturity(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });
});

describe("Failed maturity analysis due to invalid input", () => {
  test("too few answers for maturity calc", () => {
    //12 instead of 13
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   expect(() => analyzeMaturity(inputResponses)).toThrowError("Unexpected number of responses for maturity matching: 12");
  });

  test("too many answers for maturity calc", () => {
    //14 instead of 13
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   expect(() => analyzeMaturity(inputResponses)).toThrowError("Unexpected number of responses for maturity matching: 14");
  });

});
