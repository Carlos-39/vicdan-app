require("@testing-library/jest-dom");

// MSW server setup (opcional, solo si está configurado)
try {
  const { server } = require("./test/msw/server");
  if (server) {
    beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());
  }
} catch (error) {
  // MSW no está configurado, continuar sin él
}
