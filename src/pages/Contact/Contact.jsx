import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import CustomHelmet from "../../components/CustomHelmet/CustomHelmet";
import { getApiBaseUrl } from "../../utils/apiConfig";
import { getErrorMessage } from "../../utils/errorMessage";

const EMPTY_FORM = { name: "", email: "", phone: "", subject: "", message: "" };

// Mirrors the server's contactSchema so the customer is told what is wrong
// before a round trip. The server remains the authority.
const validateForm = ({ name, email, phone, subject, message }) => {
  const errors = {};
  if (!name.trim()) errors.name = "Name is required";
  else if (name.length > 100) errors.name = "Name must be under 100 characters";

  if (!email.trim()) errors.email = "Valid email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Valid email is required";

  if (phone && phone.length > 20) errors.phone = "Phone must be under 20 characters";
  if (subject && subject.length > 200) errors.subject = "Subject must be under 200 characters";

  if (!message.trim()) errors.message = "Message is required";
  else if (message.length > 5000) errors.message = "Message must be under 5000 characters";

  return errors;
};

const fieldClass =
  "w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 transition-ui duration-300 outline-none focus:border-primary font-body-base";
const labelClass =
  "font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.2em] mb-2 block";

const Contact = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const found = validateForm(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSubmitting(true);
    axios
      .post(`${getApiBaseUrl()}/contact`, form)
      .then(() => {
        setSubmitted(true);
        setForm(EMPTY_FORM);
      })
      .catch((error) => {
        // The endpoint is rate limited to 5 submissions per 15 minutes, which
        // reads as a generic failure unless it is called out.
        if (error.response?.status === 429) {
          toast.error("You've sent several messages already. Please try again in a few minutes.");
          return;
        }
        toast.error(getErrorMessage(error, "Failed to send message. Please try again."));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <main className="min-h-screen bg-background font-body-base text-on-surface pt-32 pb-section-gap-lg">
      <CustomHelmet title={"Contact Us"} />

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <header className="text-center mb-16">
          <span className="font-display-lg italic text-[14px] text-secondary block mb-2 opacity-80 lowercase tracking-widest">
            we'd love to hear from you
          </span>
          <h1 className="font-display-lg text-headline-md text-on-surface">Contact Us</h1>
          <p className="font-body-base text-on-surface-variant text-sm mt-4 max-w-xl mx-auto">
            Questions about a piece, a custom commission, or an existing order — send us a note and
            we'll get back to you.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter max-w-4xl mx-auto">
          {/* Details */}
          <aside className="space-y-8">
            <div>
              <span className={labelClass}>Visit</span>
              <p className="text-on-surface">Sri Ram Jewellery</p>
              <p className="text-on-surface-variant text-sm">Tamil Nadu, India</p>
            </div>
            <div>
              <span className={labelClass}>Hours</span>
              <p className="text-on-surface-variant text-sm">Monday – Saturday, 10:00 – 20:00</p>
            </div>
            <div>
              <span className={labelClass}>Response Time</span>
              <p className="text-on-surface-variant text-sm">
                We reply to most messages within one business day.
              </p>
            </div>
          </aside>

          {/* Form */}
          <section>
            {submitted ? (
              <div className="border border-outline-variant/30 bg-surface-container-low p-8 text-center space-y-4">
                <span className="material-symbols-outlined text-5xl text-primary">mark_email_read</span>
                <h2 className="font-display-lg text-headline-sm text-primary">Message Sent</h2>
                <p className="text-on-surface-variant text-sm">
                  Thank you for reaching out. We'll be in touch shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center justify-center min-h-11 px-6 py-3 border border-primary text-primary font-button-text uppercase tracking-[0.2em] text-[12px] hover:bg-primary hover:text-white transition-colors"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit} noValidate>
                <div>
                  <label className={labelClass} htmlFor="contact-name">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    className={fieldClass}
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={setField("name")}
                  />
                  {errors.name && (
                    <span className="text-error text-xs mt-1 block font-semibold">{errors.name}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    className={fieldClass}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={setField("email")}
                  />
                  {errors.email && (
                    <span className="text-error text-xs mt-1 block font-semibold">{errors.email}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="contact-phone">
                    Phone <span className="normal-case tracking-normal opacity-60">(optional)</span>
                  </label>
                  <input
                    id="contact-phone"
                    className={fieldClass}
                    type="tel"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={setField("phone")}
                  />
                  {errors.phone && (
                    <span className="text-error text-xs mt-1 block font-semibold">{errors.phone}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="contact-subject">
                    Subject <span className="normal-case tracking-normal opacity-60">(optional)</span>
                  </label>
                  <input
                    id="contact-subject"
                    className={fieldClass}
                    type="text"
                    placeholder="What is this about?"
                    value={form.subject}
                    onChange={setField("subject")}
                  />
                  {errors.subject && (
                    <span className="text-error text-xs mt-1 block font-semibold">{errors.subject}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="contact-message">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    className={`${fieldClass} resize-y`}
                    placeholder="Tell us how we can help"
                    value={form.message}
                    onChange={setField("message")}
                  />
                  {errors.message && (
                    <span className="text-error text-xs mt-1 block font-semibold">{errors.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-4 md:py-5 font-button-text uppercase tracking-[0.2em] text-[12px] hover:bg-primary-container transition-ui duration-500 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Contact;
