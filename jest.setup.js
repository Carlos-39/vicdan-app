import "@testing-library/jest-dom/extend-expect";
import { server } from "./test/msw/server"; // MSW server shared

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
