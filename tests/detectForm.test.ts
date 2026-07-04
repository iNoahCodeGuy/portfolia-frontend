import { describe, it, expect } from "vitest";
import { detectForm, detectContactForm } from "../components/ContactForm";

// The exact crush form message the assistant sends (see CLAUDE.md conversation 4)
const CRUSH_MESSAGE = [
  "Didn't expect anyone to actually pick this one. Respect the commitment though. I can let Noah know someone came through with intentions. Fill this out:",
  "",
  "Name:",
  "Number or social:",
  "Message for Noah:",
  "",
  "Want to stay anonymous? Just leave name and number blank.",
].join("\n");

// The exact contact form message the assistant sends (see CLAUDE.md conversation 6)
const CONTACT_MESSAGE = [
  "Yes. If you want to discuss your project, I can set up a connection right now. Fill this out:",
  "",
  "Name:",
  "Number:",
  "Email:",
  "Company:",
  "How did you find this website?:",
  "Additional information:",
].join("\n");

describe("detectForm", () => {
  describe("crush form detection", () => {
    it("detects the crush form from the 'Message for Noah:' marker", () => {
      const { formType } = detectForm(CRUSH_MESSAGE);
      expect(formType).toBe("crush");
    });

    it("strips the form field lines and everything after them from the preamble", () => {
      const { preamble } = detectForm(CRUSH_MESSAGE);
      expect(preamble).toBe(
        "Didn't expect anyone to actually pick this one. Respect the commitment though. I can let Noah know someone came through with intentions. Fill this out:",
      );
    });

    it("matches the marker case-insensitively", () => {
      const { formType } = detectForm("MESSAGE FOR NOAH:");
      expect(formType).toBe("crush");
    });

    it("matches the marker with whitespace before the colon", () => {
      const { formType } = detectForm("Message for Noah :");
      expect(formType).toBe("crush");
    });

    it("triggers on a marker mid-sentence (current behavior) and drops that line from the preamble", () => {
      const content = "Just write your Message for Noah: keep it short.";
      const result = detectForm(content);
      expect(result.formType).toBe("crush");
      // The marker line is the first line, so nothing is left as preamble
      expect(result.preamble).toBe("");
    });

    it("takes precedence over contact detection when both patterns are present", () => {
      const content = "Name:\nEmail:\nCompany:\nMessage for Noah:";
      expect(detectForm(content).formType).toBe("crush");
    });
  });

  describe("contact form detection", () => {
    it("detects the contact form when Name, Email, and Company field lines are present", () => {
      const { formType } = detectForm(CONTACT_MESSAGE);
      expect(formType).toBe("contact");
    });

    it("keeps the intro text as the preamble and strips all field lines", () => {
      const { preamble } = detectForm(CONTACT_MESSAGE);
      expect(preamble).toBe(
        "Yes. If you want to discuss your project, I can set up a connection right now. Fill this out:",
      );
    });

    it("matches field labels case-insensitively", () => {
      const content = "Let's connect.\n\nname:\nemail:\ncompany:";
      const result = detectForm(content);
      expect(result.formType).toBe("contact");
      expect(result.preamble).toBe("Let's connect.");
    });

    it("requires all three of Name, Email, and Company", () => {
      expect(detectForm("Name:\nEmail:").formType).toBeNull();
      expect(detectForm("Name:\nCompany:").formType).toBeNull();
      expect(detectForm("Email:\nCompany:").formType).toBeNull();
    });

    it("detects fields even when they share a single line (current behavior)", () => {
      const content = "Name: Sarah, Email: s@x.com, Company: Acme";
      const result = detectForm(content);
      expect(result.formType).toBe("contact");
      // The only line is a field line, so the preamble is empty
      expect(result.preamble).toBe("");
    });

    it("preserves multi-line preambles, trimming only the edges", () => {
      const content = "Line one.\nLine two.\n\nName:\nEmail:\nCompany:";
      const result = detectForm(content);
      expect(result.formType).toBe("contact");
      expect(result.preamble).toBe("Line one.\nLine two.");
    });
  });

  describe("no form", () => {
    it("returns formType null and the untouched content for plain prose", () => {
      const content = "Noah built a 22-node RAG pipeline. Ask me about it.";
      expect(detectForm(content)).toEqual({
        preamble: content,
        formType: null,
      });
    });

    it("does not trigger on field words without a colon", () => {
      const content = "The company name and email were mentioned in passing.";
      expect(detectForm(content).formType).toBeNull();
    });

    it("returns the content unmodified (not trimmed) when no form is detected", () => {
      const content = "  padded prose, no form here  ";
      expect(detectForm(content).preamble).toBe(content);
    });

    it("handles an empty string", () => {
      expect(detectForm("")).toEqual({ preamble: "", formType: null });
    });
  });
});

describe("detectContactForm (deprecated wrapper)", () => {
  it("reports hasForm true for contact form content", () => {
    const result = detectContactForm(CONTACT_MESSAGE);
    expect(result.hasForm).toBe(true);
    expect(result.preamble).toBe(
      "Yes. If you want to discuss your project, I can set up a connection right now. Fill this out:",
    );
  });

  it("reports hasForm false for crush form content", () => {
    expect(detectContactForm(CRUSH_MESSAGE).hasForm).toBe(false);
  });

  it("reports hasForm false for plain prose", () => {
    const content = "Just a normal answer about the attrition model.";
    expect(detectContactForm(content)).toEqual({
      preamble: content,
      hasForm: false,
    });
  });
});
