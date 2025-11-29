// Mock nanoid antes de importar los módulos que lo usan
jest.mock("nanoid", () => {
  let counter = 0;
  return {
    customAlphabet: () => () => {
      counter++;
      // Generar un string único basado en el contador
      const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
      let result = "";
      let num = counter;
      for (let i = 0; i < 10; i++) {
        result = chars[num % chars.length] + result;
        num = Math.floor(num / chars.length);
      }
      return result;
    },
  };
});

import { generatePublicProfileLink } from "../../src/lib/publicUrl";
import { generateSlug } from "../../src/lib/slug";

describe("Generación de URL única", () => {
  describe("generateSlug", () => {
    it("debería generar un slug con el prefijo correcto", () => {
      const slug = generateSlug("p");
      expect(slug).toMatch(/^p_[0-9a-z]{10}$/);
    });

    it("debería generar slugs únicos en múltiples llamadas", () => {
      const slugs = new Set<string>();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const slug = generateSlug("p");
        slugs.add(slug);
      }

      // Todos los slugs deberían ser únicos
      expect(slugs.size).toBe(iterations);
    });

    it("debería generar slugs con diferentes prefijos", () => {
      const slug1 = generateSlug("p");
      const slug2 = generateSlug("test");

      expect(slug1).toMatch(/^p_/);
      expect(slug2).toMatch(/^test_/);
    });

    it("debería generar slugs con el formato correcto (prefijo + guion bajo + 10 caracteres)", () => {
      const slug = generateSlug("p");
      const parts = slug.split("_");

      expect(parts).toHaveLength(2);
      expect(parts[0]).toBe("p");
      expect(parts[1]).toHaveLength(10);
      expect(parts[1]).toMatch(/^[0-9a-z]{10}$/);
    });
  });

  describe("generatePublicProfileLink", () => {
    it("debería generar una URL con el formato correcto", () => {
      const { slug, url } = generatePublicProfileLink();

      expect(slug).toMatch(/^p_[0-9a-z]{10}$/);
      expect(url).toBe(`https://vicdan-app.vercel.app/${slug}`);
    });

    it("debería generar URLs únicas en múltiples llamadas", () => {
      const urls = new Set<string>();
      const slugs = new Set<string>();
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const { slug, url } = generatePublicProfileLink();
        urls.add(url);
        slugs.add(slug);
      }

      // Todas las URLs y slugs deberían ser únicos
      expect(urls.size).toBe(iterations);
      expect(slugs.size).toBe(iterations);
    });

    it("debería incluir el slug en la URL generada", () => {
      const { slug, url } = generatePublicProfileLink();

      expect(url).toContain(slug);
      expect(url).toMatch(new RegExp(`/${slug}$`));
    });

    it("debería usar la base URL correcta", () => {
      const { url } = generatePublicProfileLink();

      expect(url).toMatch(/^https:\/\/vicdan-app\.vercel\.app\/p_/);
    });

    it("debería retornar tanto el slug como la URL", () => {
      const result = generatePublicProfileLink();

      expect(result).toHaveProperty("slug");
      expect(result).toHaveProperty("url");
      expect(typeof result.slug).toBe("string");
      expect(typeof result.url).toBe("string");
    });
  });
});
