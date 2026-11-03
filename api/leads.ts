import type { VercelRequest, VercelResponse } from "@vercel/node";

type LeadSource = "contact-form" | "offer-popup";

/**
 * Limits shared with the browser forms. Keep these in step with
 * `src/lib/leads.ts` — the function is deployed on its own, so it cannot
 * import from `src/`.
 */
const NAME_MIN = 2;
const NAME_MAX = 80;
const PHONE_DIGITS_MIN = 7;
const PHONE_DIGITS_MAX = 15; // E.164 ceiling
const PHONE_MAX_LENGTH = 30;
const MESSAGE_MAX = 200;
const SERVICE_MAX = 120;
const PAGE_MAX = 200;
const SUPPORTED_LOCALES = ["pl", "uk", "ru", "en"];

/** The studio is in Poland; notification times are shown in its clock. */
const STUDIO_TIME_ZONE = "Europe/Warsaw";

/* --- Spam protection ----------------------------------------------------
 * Three cheap layers, none of which bother a real visitor:
 *  1. Honeypot: a field hidden from people that naive bots fill in.
 *  2. Fill time: a form submitted faster than a person can type is a bot.
 *  3. Rate limit per IP. This lives in the function instance's memory, so it
 *     is per-instance, not global — enough to stop a single script hammering
 *     the endpoint. A shared store (Vercel KV / Upstash) would make it exact.
 * Requests caught by 1 and 2 get a fake success so bots learn nothing. */
const MIN_FILL_TIME_MS = 1500;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const requestLog = new Map<string, number[]>();

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (
    first?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string | undefined) ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter(
    (at) => now - at < RATE_LIMIT_WINDOW_MS,
  );

  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (requestLog.size > 5000) {
    for (const [key, times] of requestLog) {
      if (times.every((at) => now - at >= RATE_LIMIT_WINDOW_MS)) {
        requestLog.delete(key);
      }
    }
  }

  return false;
}

function looksLikeBot(body: unknown): boolean {
  const data = (body ?? {}) as Record<string, unknown>;

  // Honeypot: any value at all means a script filled every field it found.
  if (normalizeString(data.company)) return true;

  const elapsed = Number(data.elapsedMs);
  if (Number.isFinite(elapsed) && elapsed < MIN_FILL_TIME_MS) return true;

  return false;
}

type LeadPayload = {
  source: LeadSource;
  name: string;
  phone: string;
  service?: string;
  message?: string;
  locale?: string;
  page?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidSource(value: string): value is LeadSource {
  return value === "contact-form" || value === "offer-popup";
}

function isValidPhone(value: string): boolean {
  // Only digits, spaces, +, (, ), - and dots are allowed, and the digits
  // themselves must add up to a plausible phone number. The previous check
  // stripped the junk first, so "((((((" passed.
  if (value.length > PHONE_MAX_LENGTH) return false;
  if (!/^[\d\s+().-]+$/.test(value)) return false;

  const digits = value.replace(/\D/g, "").length;
  return digits >= PHONE_DIGITS_MIN && digits <= PHONE_DIGITS_MAX;
}

function isValidationErrorMessage(message: string): boolean {
  return (
    message === "Invalid source" ||
    message === "Invalid name" ||
    message === "Invalid phone" ||
    message === "Message is too long" ||
    message === "Service is too long" ||
    message === "Service is required for contact form"
  );
}

function buildTelegramMessage(payload: LeadPayload): string {
  const sourceLabel =
    payload.source === "offer-popup" ? "Попап (скидка)" : "Форма контакта";

  // Serverless functions run in UTC; without an explicit zone every lead
  // arrived stamped one or two hours early.
  const time = new Date().toLocaleString("ru-RU", {
    timeZone: STUDIO_TIME_ZONE,
  });

  const serviceLine = payload.service
    ? `\n<b>🧼 Услуга:</b> ${escapeHtml(payload.service)}`
    : "";

  const messageLine = payload.message
    ? `\n<b>💬 Сообщение:</b>\n${escapeHtml(payload.message)}`
    : "";

  const localeLine = payload.locale
    ? `\n<b>🌐 Язык:</b> ${escapeHtml(payload.locale)}`
    : "";

  const pageLine = payload.page
    ? `\n<b>📍 Страница:</b> ${escapeHtml(payload.page)}`
    : "";

  const phoneClean = payload.phone.replace(/\D/g, "");

  return (
    `🔥 <b>Новая заявка</b>\n\n` +
    `<b>👤 Имя:</b> ${escapeHtml(payload.name)}\n` +
    `<b>📞 Телефон:</b> <a href="tel:${phoneClean}">${escapeHtml(payload.phone)}</a>\n` +
    `<b>📲 WhatsApp:</b> <a href="https://wa.me/${phoneClean}">написать</a>\n` +
    `<b>📦 Источник:</b> ${sourceLabel}\n` +
    `<b>⏱ Время:</b> ${time}` +
    serviceLine +
    messageLine +
    localeLine +
    pageLine
  );
}

function getTelegramChatIds(): string[] {
  const chatIdsRaw = process.env.TELEGRAM_CHAT_IDS;

  if (!chatIdsRaw) {
    throw new Error("TELEGRAM_CHAT_IDS is missing");
  }

  const chatIds = chatIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (chatIds.length === 0) {
    throw new Error("No Telegram chat IDs configured");
  }

  return chatIds;
}

async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing");
  }

  const chatIds = getTelegramChatIds();

  const results = await Promise.allSettled(
    chatIds.map(async (chatId) => {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Telegram send failed for ${chatId}: ${errorText}`);
      }
    }),
  );

  const failed = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );

  if (failed.length === chatIds.length) {
    throw new Error(
      failed
        .map((item) => item.reason?.message || "Unknown Telegram error")
        .join(" | "),
    );
  }

  if (failed.length > 0) {
    console.error(
      "Some Telegram messages failed:",
      failed.map((item) => item.reason?.message || "Unknown Telegram error"),
    );
  }
}

async function sendAdminEmail(payload: LeadPayload): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromEmail = process.env.FROM_EMAIL;

  if (!resendApiKey || !adminEmail || !fromEmail) {
    return;
  }

  const sourceLabel =
    payload.source === "offer-popup" ? "Offer Popup" : "Contact Form";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin: 0 0 16px;">Новая заявка с сайта</h2>
      <p><strong>Источник:</strong> ${escapeHtml(sourceLabel)}</p>
      <p><strong>Имя:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Телефон:</strong> ${escapeHtml(payload.phone)}</p>
      ${
        payload.service
          ? `<p><strong>Услуга:</strong> ${escapeHtml(payload.service)}</p>`
          : ""
      }
      ${
        payload.message
          ? `<p><strong>Сообщение:</strong><br/>${escapeHtml(payload.message).replaceAll("\n", "<br/>")}</p>`
          : ""
      }
      ${
        payload.locale
          ? `<p><strong>Язык:</strong> ${escapeHtml(payload.locale)}</p>`
          : ""
      }
      ${
        payload.page
          ? `<p><strong>Страница:</strong> ${escapeHtml(payload.page)}</p>`
          : ""
      }
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [adminEmail],
      subject: `Новая заявка: ${sourceLabel}`,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email send failed: ${errorText}`);
  }
}

function parsePayload(req: VercelRequest): LeadPayload {
  const source = normalizeString(req.body?.source);
  const name = normalizeString(req.body?.name);
  const phone = normalizeString(req.body?.phone);
  const service = normalizeString(req.body?.service);
  const message = normalizeString(req.body?.message);
  const localeRaw = normalizeString(req.body?.locale);
  const locale = SUPPORTED_LOCALES.includes(localeRaw) ? localeRaw : "";
  const page = normalizeString(req.body?.page).slice(0, PAGE_MAX);

  if (!isValidSource(source)) {
    throw new Error("Invalid source");
  }

  if (!name || name.length < NAME_MIN || name.length > NAME_MAX) {
    throw new Error("Invalid name");
  }

  if (!phone || !isValidPhone(phone)) {
    throw new Error("Invalid phone");
  }

  if (message.length > MESSAGE_MAX) {
    throw new Error("Message is too long");
  }

  if (service.length > SERVICE_MAX) {
    throw new Error("Service is too long");
  }

  if (source === "contact-form" && !service) {
    throw new Error("Service is required for contact form");
  }

  return {
    source,
    name,
    phone,
    service: service || undefined,
    message: message || undefined,
    locale: locale || undefined,
    page: page || undefined,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (looksLikeBot(req.body)) {
    return res.status(200).json({ ok: true });
  }

  if (isRateLimited(getClientIp(req))) {
    return res
      .status(429)
      .json({ ok: false, error: "Too many requests, try again later" });
  }

  try {
    const payload = parsePayload(req);
    const telegramMessage = buildTelegramMessage(payload);

    await sendTelegramMessage(telegramMessage);

    try {
      await sendAdminEmail(payload);
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    // Full detail stays in the server log.
    console.error("Lead handler error:", error);

    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    if (isValidationErrorMessage(message)) {
      return res.status(400).json({ ok: false, error: message });
    }

    // Never echo internal failures (missing tokens, upstream responses) back
    // to the browser — they leak configuration and mean nothing to a visitor.
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
