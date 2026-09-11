import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HeroActions from "../components/HeroActions";
import HeroSwiper from "../components/HeroSwiper";
import { contact, defaultSlides } from "../lib/defaults";

describe("hero contact journey", () => {
  it("puts the configured LINE destination first while preserving the phone link", () => {
    const html = renderToStaticMarkup(createElement(HeroActions, { href: contact.line }));
    expect(html.indexOf(`href="${contact.line}"`)).toBeLessThan(html.indexOf(`href="${contact.tel}"`));
    expect(html).toContain("ส่งพิกัดทาง LINE");
  });
  it("renders a custom slide destination without removing emergency contact actions", () => {
    const html = renderToStaticMarkup(createElement(HeroActions, { href: "/#services" }));
    for (const href of ["/#services", contact.tel, contact.line]) expect(html).toContain(`href="${href}"`);
  });
  it("renders one main heading and the configured hero slides", () => {
    const html = renderToStaticMarkup(createElement(HeroSwiper, { slides: defaultSlides }));
    expect((html.match(/<h1\b/g) || []).length).toBe(1);
    expect(html).toContain("รถสตาร์ทไม่ติด?");
    expect(html).toContain("เปลี่ยนแบตถึงที่ 24 ชม.");
    expect(html).toContain('aria-label="บริการเปลี่ยนแบตเตอรี่"');
    expect(html).toContain('aria-label="ไปยังสไลด์ 1"');
    expect(html).toContain('aria-label="ไปยังสไลด์ 2"');
    for (const slide of defaultSlides) {
      expect(html).toContain(`alt="${slide.title.replaceAll("\n", " ")}"`);
    }
    expect(html).toContain(defaultSlides[0].subtitle);
  });
});
