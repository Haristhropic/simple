"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { sendContactMessage } from "@/lib/actions";

export default function ContactPage() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await sendContactMessage({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        subject: (formData.get("subject") as string) || null,
        message: formData.get("message") as string,
      });

      if (result?.success) {
        setState("success");
      } else {
        setError("Failed to send message. Please try again.");
        setState("error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      if (msg.includes("Invalid")) {
        setError("Please check your input and try again.");
      } else {
        setError(msg);
      }
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-medium tracking-tighter sm:text-4xl">Thank You</h1>
          <p className="mt-4 text-base text-muted-foreground">Your message has been received. We&apos;ll be in touch.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Connect
          </span>
          <h1 className="mt-3 text-3xl font-medium tracking-tighter sm:text-4xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            We&apos;d love to hear from you. Whether it&apos;s a question about a piece,
            a collaboration inquiry, or just to say hello.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={state === "loading"}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={state === "loading"}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              disabled={state === "loading"}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              placeholder="How can we help?"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              disabled={state === "loading"}
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              placeholder="Tell us more..."
            />
          </div>

          <button
            type="submit"
            disabled={state === "loading"}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50 sm:w-auto"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
