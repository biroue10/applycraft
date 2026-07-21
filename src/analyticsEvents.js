// Shared event names stay in the bootstrap bundle; consent checks and GA
// plumbing are loaded only after consented analytics is actually needed.
export const EVENTS = {
  RESUME_STARTED: "resume_started", RESUME_EXPORTED: "resume_exported", AI_TAILORING_USED: "ai_tailoring_used",
  EMAIL_CAPTURED: "email_captured", CHECKOUT_STARTED: "checkout_started", CHECKOUT_COMPLETED: "checkout_completed",
  HERO_CTA_CLICKED: "hero_cta_clicked", TEMPLATE_PREVIEW_OPENED: "template_preview_opened", TEMPLATE_SELECTED: "template_selected",
  COVER_STARTED: "cover_letter_started", ATS_STARTED: "ats_checker_started", PRICING_OPENED: "pricing_opened",
  INTERFACE_LANGUAGE_SELECTED: "interface_language_selected", DOCUMENT_LANGUAGE_SELECTED: "document_language_selected",
  RTL_INTERFACE_ENABLED: "rtl_interface_enabled", RTL_DOCUMENT_ENABLED: "rtl_document_enabled",
  MULTILINGUAL_RESUME_EXPORTED: "multilingual_resume_exported", MULTILINGUAL_COVER_LETTER_EXPORTED: "multilingual_cover_letter_exported",
  PDF_EXPORT_STARTED: "pdf_export_started", PDF_EXPORT_COMPLETED: "pdf_export_completed", PDF_EXPORT_FAILED: "pdf_export_failed",
  DOCX_EXPORT_STARTED: "docx_export_started", DOCX_EXPORT_COMPLETED: "docx_export_completed", DOCX_EXPORT_FAILED: "docx_export_failed",
  LANGUAGE_MIGRATION_COMPLETED: "language_migration_completed", LANGUAGE_MIGRATION_FAILED: "language_migration_failed",
  MISSING_TRANSLATION_KEY: "missing_translation_key", TRANSLATION_STARTED: "translation_started",
  TRANSLATION_COPY_CREATED: "translation_copy_created", DOCUMENT_AUTOSAVE_DISABLED: "document_autosave_disabled",
  BEFOREUNLOAD_WARNING_SHOWN: "beforeunload_warning_shown",
};
