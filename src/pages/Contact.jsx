import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const Contact = () => {
  const user = useSelector((state) => state.auth.user);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

  useEffect(() => {
    if (PUBLIC_KEY) {
      emailjs.init({ publicKey: PUBLIC_KEY });
    }
  }, [PUBLIC_KEY]);

  useEffect(() => {
    if (user?.name || user?.email) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (!isEmailConfigured) {
      const msg = "Email service is not configured. Add your EmailJS keys.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          name: form.name,
          email: form.email,
          message: form.message,
        },
        { publicKey: PUBLIC_KEY },
      );
      setSuccess("Message sent successfully!");
      toast.success("Message sent successfully!");
      setForm({
        name: user?.name || "",
        email: user?.email || "",
        message: "",
      });
    } catch (err) {
      console.error("EmailJS send error", err);
      const msg =
        err?.status === 404
          ? "Failed to send message. Check your EmailJS Service ID, Template ID, and Public Key."
          : "Failed to send message. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white dark:from-[#0a1535] dark:via-[#0f1f4a] dark:to-[#0a1535] text-gray-800 dark:text-gray-100 pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 bg-white/70 dark:bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100/40 dark:border-blue-900/40 p-8">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#152B67] to-blue-400 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Have a question, feedback, or partnership idea? Send us a message
            and we will respond shortly.
          </p>
          <div className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-200">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                @
              </span>
              <div>
                <p className="font-semibold">Email</p>
                <p>hello@unibazzar.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                24h
              </span>
              <div>
                <p className="font-semibold">Response time</p>
                <p>Within one business day</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white/80 dark:bg-[#0d1636] backdrop-blur-lg rounded-2xl shadow-2xl border border-blue-100/40 dark:border-blue-900/40 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {success && (
              <div className="rounded-lg bg-green-50 text-green-800 border border-green-200 px-4 py-3 text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 text-red-800 border border-red-200 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-blue-100/70 dark:border-blue-800/60 bg-white/90 dark:bg-white/5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-3 rounded-xl border border-blue-100/70 dark:border-blue-800/60 bg-white/90 dark:bg-white/5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold">Message</label>
              <textarea
                placeholder="How can we help you?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full p-3 rounded-xl border border-blue-100/70 dark:border-blue-800/60 bg-white/90 dark:bg-white/5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                rows="6"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#152B67] to-blue-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

