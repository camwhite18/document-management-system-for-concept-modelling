import "regenerator-runtime/runtime";
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
import "cross-fetch/polyfill";

//Establish env variables
process.env.API_URL = "http://localhost/api";
process.env.NODE_ENV = "testing";

jest.mock("../src/utils/tooltip.ts");
jest.mock("../src/state/dispatch.ts", () => {
    return {
        appDispatch: jest.fn(),
    };
});
