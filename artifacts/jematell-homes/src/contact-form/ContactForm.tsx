"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Phone, ArrowRight, ChevronLeft, Send, X } from "lucide-react";
import { loadGTM, reportConversion, getTrackingData, newTransactionId } from "./analytics";
import { submitContactForm } from "./submit";
import { siteConfig } from "./siteConfig";
import { useSafeTimeouts } from "./useSafeTimeouts";
import { formatPhone, validEmail, actionChips, topicChips } from "./formData";

type Step = "details" | "message" | "thankYou";

interface FormData {
  name: string;
  phone: string;
  email: string;
}

const slideVariants = {
  enter: { opacity: 0, y: 30 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function useTypingAnimation() {
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef = useRef("");

  const clearTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const appendTo = useCallback((fullText: string, onComplete?: () => void, hideCursorAfter = false) => {
    clearTyping();
    setShowCursor(true);
    if (reducedRef.current) {
      textRef.current = fullText;
      setDisplayText(fullText);
      if (hideCursorAfter) setShowCursor(false);
      onComplete?.();
      return;
    }
    const startFrom = textRef.current.length;
    let i = startFrom;
    const typeChar = () => {
      if (i < fullText.length) {
        const nextI = i + 1;
        const next = fullText.substring(0, nextI);
        textRef.current = next;
        setDisplayText(next);
        i = nextI;
        timeoutRef.current = setTimeout(typeChar, 28);
      } else {
        textRef.current = fullText;
        setDisplayText(fullText);
        if (hideCursorAfter) setShowCursor(false);
        onComplete?.();
      }
    };
    typeChar();
  }, [clearTyping]);

  const resetAndType = useCallback((text: string, onComplete?: () => void) => {
    clearTyping();
    textRef.current = "";
    setDisplayText("");
    setShowCursor(true);
    if (reducedRef.current) {
      textRef.current = text;
      setDisplayText(text);
      onComplete?.();
      return;
    }
    let i = 0;
    const typeChar = () => {
      if (i < text.length) {
        const nextI = i + 1;
        const next = text.substring(0, nextI);
        textRef.current = next;
        setDisplayText(next);
        i = nextI;
        timeoutRef.current = setTimeout(typeChar, 28);
      } else {
        textRef.current = text;
        setDisplayText(text);
        onComplete?.();
      }
    };
    typeChar();
  }, [clearTyping]);

  const setText = useCallback((text: string) => {
    clearTyping();
    textRef.current = text;
    setDisplayText(text);
  }, [clearTyping]);

  return { displayText, showCursor, setShowCursor, appendTo, resetAndType, setText, clearTyping };
}

interface ContactFormProps {
  onClose?: () => void;
  variant?: "modal" | "inline";
}

export default function ContactForm({ onClose, variant = "modal" }: ContactFormProps = {}) {
  const isInline = variant === "inline";
  const reduced = useReducedMotion();
  const slideTransition = reduced
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
  const tapProps = reduced ? {} : { whileTap: { scale: 0.97 } };
  const { safeTimeout } = useSafeTimeouts();
  const [step, setStep] = useState<Step>("details");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [actionValue, setActionValue] = useState("");
  const [topicValue, setTopicValue] = useState("");
  const [actionChosen, setActionChosen] = useState(false);
  const [topicChosen, setTopicChosen] = useState(false);

  const [otherTopicValue, setOtherTopicValue] = useState("");
  const [questionValue, setQuestionValue] = useState("");

  const [manualMode, setManualMode] = useState(false);
  const [manualMessage, setManualMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [, setSentenceComplete] = useState(false);
  const [activeChipGroup, setActiveChipGroup] = useState<string>("none");
  const [messageInitialized, setMessageInitialized] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  const lastSubmitTime = useRef(0);
  const recentSubs = useRef(new Map<string, number>());
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageScrollRef = useRef<HTMLDivElement>(null);
  const hiddenMessageRef = useRef("");

  const typing = useTypingAnimation();

  useEffect(() => {
    loadGTM();
    // Autofocusing the name field makes sense for the floating modal (it just
    // opened, nothing else is on screen), but for the inline card embedded in
    // the contact page it forces the browser to scroll the field into view on
    // mount, hijacking the page's normal scroll position. Skip it there.
    if (!isInline) {
      safeTimeout(() => nameRef.current?.focus(), 400);
    }
    return () => typing.clearTyping();
  }, [safeTimeout, isInline]);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });
  }, []);

  const getProgress = useCallback(() => {
    if (step === "details") return 0.3;
    if (step === "message") return 0.65;
    if (step === "thankYou") return 1;
    return 0.65;
  }, [step]);

  const getBgPosition = useCallback(() => {
    if (step === "details") return "34% 47%";
    if (step === "message") return "54% 44%";
    if (step === "thankYou") return "75% 48%";
    return "50% 46%";
  }, [step]);

  const computeMessage = useCallback(() => {
    if (manualMode) {
      return manualMessage.trim() || "No message";
    }
    const tVal = topicValue === "other" && otherTopicValue.trim() ? otherTopicValue.trim() : topicValue;
    if (actionValue && tVal) {
      let msg = "I would like to " + actionValue + " about " + tVal + ".";
      if (actionValue === "ask a question" && questionValue.trim()) msg += " Question: " + questionValue.trim();
      return msg;
    }
    return "";
  }, [manualMode, manualMessage, actionValue, topicValue, otherTopicValue, questionValue]);

  useEffect(() => {
    const msg = computeMessage();
    hiddenMessageRef.current = msg;
    setSentenceComplete(msg.length > 0 && !manualMode ? true : manualMode && manualMessage.trim().length > 0);
  }, [computeMessage, manualMode, manualMessage]);

  const scrollToBottom = useCallback(() => {
    safeTimeout(() => {
      messageScrollRef.current?.scrollTo({ top: messageScrollRef.current.scrollHeight, behavior: "smooth" });
    }, 300);
  }, [safeTimeout]);

  const typingRef = useRef(typing);
  typingRef.current = typing;

  const initializeMessageStep = useCallback(() => {
    setActionValue("");
    setTopicValue("");
    setActionChosen(false);
    setTopicChosen(false);
    setOtherTopicValue("");
    setQuestionValue("");
    setManualMode(false);
    setManualMessage("");
    setSentenceComplete(false);
    setActiveChipGroup("action");
    typing.resetAndType("I would like to ");
  }, [typing]);

  useEffect(() => {
    if (step === "message" && !messageInitialized) {
      setMessageInitialized(true);
      safeTimeout(initializeMessageStep, 500);
    }
  }, [step, messageInitialized]);

  const handleActionChipClick = useCallback((value: string) => {
    setActionValue(value);
    setActionChosen(true);
    const prefix = "I would like to " + value;
    typingRef.current.appendTo(prefix, () => {
      setActiveChipGroup("fade-action");
      safeTimeout(() => {
        typingRef.current.appendTo(prefix + " about ", () => {
          setActiveChipGroup("topic");
        });
      }, 400);
    });
  }, [safeTimeout]);

  const handleTopicChipClick = useCallback((value: string) => {
    setTopicValue(value);
    setTopicChosen(true);
    const prefix = "I would like to " + actionValue + " about ";

    if (value === "other") {
      setActiveChipGroup("fade-topic");
      safeTimeout(() => {
        typingRef.current.setShowCursor(false);
        setActiveChipGroup("otherTopic");
        scrollToBottom();
      }, 300);
    } else {
      typingRef.current.appendTo(prefix + value + ".", () => {
        typingRef.current.setShowCursor(false);
        if (actionValue === "ask a question") {
          setActiveChipGroup("fade-topic");
          safeTimeout(() => {
            setActiveChipGroup("question");
            scrollToBottom();
          }, 400);
        } else {
          setActiveChipGroup("complete");
          scrollToBottom();
        }
      });
    }
  }, [actionValue, scrollToBottom, safeTimeout]);

  const validateStep = useCallback((s: Step): boolean => {
    const errs: Record<string, string> = {};
    if (s === "details") {
      if (!formData.name.trim()) errs.name = "Please enter your name";
      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length < 10) errs.phone = "Please enter a valid phone number";
      if (!formData.email.trim() || !validEmail(formData.email)) errs.email = "Please enter a valid email address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData]);

  const goNext = useCallback(() => {
    if (!validateStep(step)) return;
    if (step === "details") {
      setStep("message");
    }
  }, [step, validateStep]);

  const goBack = useCallback(() => {
    if (step === "message") setStep("details");
  }, [step]);

  const handleEnter = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goNext();
    }
  }, [goNext]);

  const toggleManual = useCallback(() => {
    if (!manualMode) {
      setManualMode(true);
      setActiveChipGroup("manual");
      typing.setText("");
      typing.setShowCursor(false);
    } else {
      setManualMode(false);
      setManualMessage("");
      if (!actionChosen) {
        setActiveChipGroup("action");
        typing.resetAndType("I would like to ");
      } else if (!topicChosen) {
        typing.setText("I would like to " + actionValue + " about ");
        setActiveChipGroup("topic");
        typing.setShowCursor(true);
      } else {
        const tVal = topicValue === "other" ? otherTopicValue || "" : topicValue;
        if (tVal) {
          typing.setText("I would like to " + actionValue + " about " + tVal + ".");
          typing.setShowCursor(false);
          setActiveChipGroup("complete");
        } else {
          typing.setText("I would like to " + actionValue + " about ");
          setActiveChipGroup("topic");
          typing.setShowCursor(true);
        }
      }
    }
  }, [manualMode, actionChosen, topicChosen, actionValue, topicValue, otherTopicValue, typing]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    const now = Date.now();
    if (now - lastSubmitTime.current < 3000) {
      setDuplicateWarning(true);
      safeTimeout(() => setDuplicateWarning(false), 3000);
      return;
    }

    const msg = hiddenMessageRef.current;
    if (!msg) return;

    const dedupeSource = formData.name + formData.email + msg;
    let h = 0;
    for (let i = 0; i < dedupeSource.length; i++) {
      h = (h * 31 + dedupeSource.charCodeAt(i)) | 0;
    }
    const hash = String(h);
    if (recentSubs.current.has(hash) && now - recentSubs.current.get(hash)! < 30000) {
      setDuplicateWarning(true);
      safeTimeout(() => setDuplicateWarning(false), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(false);
    lastSubmitTime.current = now;
    recentSubs.current.set(hash, now);

    const tracking = getTrackingData();

    // Report the chips themselves, not just the sentence they composed, so the
    // acknowledgment can be tailored without the server re-parsing prose that
    // changes whenever a chip label is edited. Omitted entirely in manual mode:
    // a typed message has no selection to report.
    const selection = manualMode
      ? undefined
      : {
          action: actionValue,
          topic: topicValue,
          otherTopic: topicValue === "other" ? otherTopicValue.trim() : "",
          question: actionValue === "ask a question" ? questionValue.trim() : "",
        };

    // Made once per submission and shared by the post and the conversion
    // push, so the portal holds the same order id Google Ads recorded.
    const transactionId = newTransactionId();

    try {
      const result = await submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: msg,
        selection,
        transaction_id: transactionId,
        tracking,
      });
      if (result.success) {
        setStep("thankYou");
        reportConversion(
          { name: formData.name, email: formData.email, phone: formData.phone },
          "contact_submission",
          true,
          siteConfig.conversionValue.newContact,
          transactionId,
        );
      } else {
        console.error("Form submission error:", result.error);
        setSubmitError(true);
        recentSubs.current.delete(hash);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setSubmitError(true);
      recentSubs.current.delete(hash);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, formData, safeTimeout]);

  // When the inline form advances past step 1, lift into a full-screen portal
  // so the sentence builder has the same room as the regular floating modal.
  const showAsModal = isInline && step !== "details";

  // Reset the inline form back to empty details (used when closing the expanded modal)
  const resetInlineForm = useCallback(() => {
    typing.clearTyping();
    setStep("details");
    setFormData({ name: "", phone: "", email: "" });
    setErrors({});
    setMessageInitialized(false);
    setActionValue("");
    setTopicValue("");
    setActionChosen(false);
    setTopicChosen(false);
    setOtherTopicValue("");
    setQuestionValue("");
    setManualMode(false);
    setManualMessage("");
    setSentenceComplete(false);
  }, [typing]);

  // Scroll-lock while expanded as a modal
  useEffect(() => {
    if (!showAsModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showAsModal]);

  const progress = getProgress();

  const renderChipGroup = (
    chips: { value: string; label: string }[],
    selectedValue: string,
    onSelect: (v: string) => void,
    groupId: string,
  ) => (
    <m.div
      key={groupId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
      className="cf-chips"
      data-testid={`chip-group-${groupId}`}
    >
      {chips.map((c) => (
        <button
          key={c.value}
          type="button"
          data-testid={`chip-${groupId}-${c.value.replace(/\s+/g, "-")}`}
          onClick={() => onSelect(c.value)}
          className={`cf-chip ${selectedValue === c.value ? "cf-chip--selected" : ""}`}
        >
          {c.label}
        </button>
      ))}
    </m.div>
  );

  const renderSubmitControls = (backTestId: string) => (
    <div className="cf-completion">
      <button data-testid={backTestId} type="button" onClick={goBack} className="cf-back">
        <ChevronLeft size={20} /> Back
      </button>
      {duplicateWarning ? (
        <m.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="cf-dup">
          Already submitted!
        </m.div>
      ) : (
        <m.button data-testid="button-submit" type="button" onClick={handleSubmit} disabled={isSubmitting} className="cf-next" {...tapProps}>
          {isSubmitting ? (
            <>
              <span className="cf-spinner" />
              Submitting...
            </>
          ) : (
            <>
              Submit
              <Send size={20} />
            </>
          )}
        </m.button>
      )}
    </div>
  );

  const renderMessageStep = () => {
    const showCompletionUI =
      activeChipGroup === "complete" ||
      activeChipGroup === "otherTopic" ||
      activeChipGroup === "question";

    return (
      <div className="cf-step cf-step--wide" ref={messageScrollRef}>
        <div className="cf-step-head">
          <h2 className="cf-h2">Your message</h2>
          <p className="cf-sub">
            {manualMode ? (
              <>
                Type your message below, or{" "}
                <button type="button" onClick={toggleManual} className="cf-toggle" data-testid="link-toggle-guided">
                  use the guided options
                </button>
              </>
            ) : (
              <>
                Tap the options below to build your message, or{" "}
                <button type="button" onClick={toggleManual} className="cf-toggle" data-testid="link-toggle-manual">
                  click here to type your own
                </button>
              </>
            )}
          </p>
        </div>

        <div className="cf-msg-card" data-testid="sentence-card">
          {!manualMode && (
            <div className="cf-typed">
              <span data-testid="typed-text">{typing.displayText}</span>
              {typing.showCursor && <span className="cf-cursor" />}

              <AnimatePresence>
                {activeChipGroup === "otherTopic" && (
                  <m.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cf-inline-wrap">
                    <input
                      type="text"
                      data-testid="input-other-topic"
                      value={otherTopicValue}
                      onChange={(e) => setOtherTopicValue(e.target.value)}
                      placeholder="type a topic..."
                      maxLength={255}
                      className="cf-inline-input"
                      style={{ width: Math.max(140, (otherTopicValue.length + 6) * 12) + "px" }}
                      autoFocus
                    />
                    <span>.</span>
                  </m.span>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {activeChipGroup === "otherTopic" && otherTopicValue.trim() && actionValue === "ask a question" && (
                  <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.3 }}>
                    <textarea
                      data-testid="input-question"
                      value={questionValue}
                      onChange={(e) => setQuestionValue(e.target.value)}
                      placeholder="Type your question here... (optional)"
                      rows={2}
                      className="cf-build-textarea"
                    />
                  </m.div>
                )}
                {activeChipGroup === "question" && (
                  <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                    <textarea
                      data-testid="input-question-direct"
                      value={questionValue}
                      onChange={(e) => setQuestionValue(e.target.value)}
                      placeholder="Type your question here... (optional)"
                      rows={2}
                      className="cf-build-textarea"
                      autoFocus
                    />
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {manualMode && (
            <textarea
              data-testid="input-manual-message"
              value={manualMessage}
              onChange={(e) => setManualMessage(e.target.value)}
              placeholder="Tell us how we can help..."
              rows={4}
              className="cf-manual-textarea"
              autoFocus
            />
          )}
        </div>

        <AnimatePresence>
          {submitError && (
            <m.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="cf-error" role="alert" data-testid="error-submit">
              Something went wrong sending your message. Please try again, or call us at {siteConfig.phone.display}.
            </m.p>
          )}
        </AnimatePresence>

        {!manualMode && (
          <div className="cf-chiparea">
            <AnimatePresence mode="wait">
              {activeChipGroup === "action" && renderChipGroup(actionChips, "", handleActionChipClick, "action")}
              {activeChipGroup === "topic" && renderChipGroup(topicChips, "", handleTopicChipClick, "topic")}
              {showCompletionUI && (
                <m.div
                  key="completion-buttons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.3 }}
                >
                  {renderSubmitControls("button-back-message")}
                </m.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {manualMode && renderSubmitControls("button-back-message")}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case "details":
        return (
          <m.div key="details" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={slideTransition} className="cf-step">
            <div className="cf-step-head">
              <h2 className="cf-h2">Let's get started</h2>
              <p className="cf-sub">Tell us how to reach you and we'll be in touch within one business day.</p>
            </div>
            <div>
              <div className="cf-field">
                <label className="cf-label">
                  Your full name <span className="cf-req">*</span>
                </label>
                <input
                  ref={nameRef}
                  data-testid="input-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="John Smith"
                  autoComplete="name"
                  maxLength={120}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      phoneRef.current?.focus();
                    }
                  }}
                  aria-label="Your full name"
                  className={`cf-input ${errors.name ? "cf-input--error" : ""}`}
                />
                <AnimatePresence>
                  {errors.name && (
                    <m.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="cf-error" role="alert" data-testid="error-name">
                      {errors.name}
                    </m.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="cf-field">
                <label className="cf-label">
                  Phone number <span className="cf-req">*</span>
                </label>
                <input
                  ref={phoneRef}
                  data-testid="input-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", formatPhone(e.target.value))}
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={14}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      emailRef.current?.focus();
                    }
                  }}
                  className={`cf-input ${errors.phone ? "cf-input--error" : ""}`}
                />
                <AnimatePresence>
                  {errors.phone && (
                    <m.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="cf-error" role="alert" data-testid="error-phone">
                      {errors.phone}
                    </m.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="cf-field">
                <label className="cf-label">
                  Email address <span className="cf-req">*</span>
                </label>
                <input
                  ref={emailRef}
                  data-testid="input-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="john@example.com"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={100}
                  onKeyDown={handleEnter}
                  className={`cf-input ${errors.email ? "cf-input--error" : ""}`}
                />
                <AnimatePresence>
                  {errors.email && (
                    <m.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="cf-error" role="alert" data-testid="error-email">
                      {errors.email}
                    </m.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="cf-actions">
              <div />
              <m.button
                data-testid="button-next"
                type="button"
                onClick={goNext}
                disabled={
                  !formData.name.trim() ||
                  formData.phone.replace(/\D/g, "").length < 10 ||
                  !formData.email.trim()
                }
                className="cf-next"
                {...tapProps}
              >
                Next step
                <ArrowRight size={20} />
              </m.button>
            </div>
          </m.div>
        );

      case "message":
        return (
          <m.div key="message" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={slideTransition} className="cf-message-wrap">
            {renderMessageStep()}
          </m.div>
        );

      case "thankYou":
        return (
          <m.div key="thankYou" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={slideTransition} className="cf-step">
            <div className="cf-ty">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                className="cf-ty-icon"
                data-testid="icon-success"
              >
                <Check size={44} color="#fff" />
              </m.div>
              <m.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.3 }} className="cf-ty-title" data-testid="text-thank-you-title">
                Thank you — we're on it!
              </m.h2>
              <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.6 }} className="cf-ty-body">
                <p>We're grateful for the opportunity and will reach out as soon as possible, typically within one business day.</p>
                <p className="cf-ty-italic">Thanks again for choosing {siteConfig.businessName}. We look forward to speaking with you soon.</p>
                <p>
                  If this is urgent, call{" "}
                  <a href={siteConfig.phone.href} className="cf-ty-phone" data-testid="link-phone">
                    <Phone size={16} /> {siteConfig.phone.display}
                  </a>
                </p>
              </m.div>
            </div>
          </m.div>
        );

      default:
        return null;
    }
  };

  const showBg = !isInline || showAsModal;
  const overlayClass = showAsModal || !isInline ? "cf-overlay" : "cf-overlay cf-overlay--inline";

  // Close handler for the expanded inline modal:
  // — message step: go back to inline details
  // — thankYou step: reset the whole form back to inline details
  const inlineModalClose = step === "thankYou" ? resetInlineForm : goBack;

  const overlay = (
    <div className={overlayClass}>
      {showBg && (
        <div className="cf-bg">
          <m.div
            className="cf-bg-pan"
            initial={{ scale: 1.08, x: 0, y: 0, opacity: 0 }}
            animate={
              reduced
                ? { opacity: bgLoaded ? 1 : 0 }
                : { scale: [1.08, 1.09, 1.07, 1.09, 1.08], x: [0, 2, -2, 1, 0], y: [0, -1, 2, -1, 0], opacity: bgLoaded ? 1 : 0 }
            }
            transition={
              reduced
                ? { opacity: { duration: 0.35 } }
                : { duration: 35, ease: "easeInOut", repeat: Infinity, delay: 2, opacity: { duration: 0.35, delay: 0 } }
            }
          >
            <picture>
              <source media="(min-width: 601px)" srcSet={siteConfig.images.contactDesktop} />
              <m.img
                src={siteConfig.images.contactMobile}
                alt=""
                className="cf-bg-img"
                style={{ transform: "scale(1.15) translateZ(0)" }}
                animate={{ objectPosition: getBgPosition() }}
                transition={{ duration: reduced ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
                loading="eager"
                onLoad={() => setBgLoaded(true)}
              />
            </picture>
          </m.div>
          <div className="cf-bg-gradient" />
        </div>
      )}

      <div data-testid="progress-bar" className="cf-progress">
        <m.div className="cf-progress-fill" animate={{ width: `${progress * 100}%` }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 20 }} />
      </div>

      {(onClose || showAsModal) && (
        <button
          type="button"
          onClick={showAsModal ? inlineModalClose : onClose!}
          data-testid="button-modal-close"
          aria-label="Close"
          className="cf-close"
        >
          <X size={20} />
        </button>
      )}

      <div className="cf-scroll">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      <div data-testid="progress-bar-bottom" className="cf-progress cf-progress--bottom">
        <m.div className="cf-progress-fill" animate={{ width: `${progress * 100}%` }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 20 }} />
      </div>
    </div>
  );

  if (showAsModal) {
    return createPortal(
      <div className="cf-portal">{overlay}</div>,
      document.body,
    );
  }

  return overlay;
}
