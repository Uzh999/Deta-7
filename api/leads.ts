import type { VercelRequest, VercelResponse } from "@vercel/node";

type LeadSource = "contact-form" | "offer-popup";

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
  const cleaned = value.replace(/[^\d+()\-\s]/g, "").trim();
  return cleaned.length >= 6 && cleaned.length <= 30;
}

function isValidationErrorMessage(message: string): boolean {
  return (
    message === "Invalid source" ||
    message === "Invalid name" ||
    message === "Invalid phone" ||
    message === "Message is too long" ||
    message === "Service is required for contact form"
  );
}

function buildTelegramMessage(payload: LeadPayload): string {
  const sourceLabel =
    payload.source === "offer-popup" ? "Попап (скидка)" : "Форма контакта";

  const time = new Date().toLocaleString("ru-RU");

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
  const chatIds = getTelegramChatIds();

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing");
  }

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
  const locale = normalizeString(req.body?.locale);
  const page = normalizeString(req.body?.page);

  if (!isValidSource(source)) {
    throw new Error("Invalid source");
  }

  if (!name || name.length < 2 || name.length > 80) {
    throw new Error("Invalid name");
  }

  if (!phone || !isValidPhone(phone)) {
    throw new Error("Invalid phone");
  }

  if (message.length > 1000) {
    throw new Error("Message is too long");
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
    console.error("Lead handler error:", error);

    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    const statusCode = isValidationErrorMessage(message) ? 400 : 500;

    return res.status(statusCode).json({
      ok: false,
      error: message,
    });
  }
}
