require("@testing-library/jest-dom");

// Solo configurar MSW si el servidor existe
try {
  const { server } = require("./test/msw/server");
  if (server) {
    beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());
  }
} catch (error) {
  // MSW no está disponible, continuar sin él
  console.log("MSW server not available, skipping setup");
}
