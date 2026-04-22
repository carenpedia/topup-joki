import { Resend } from "resend";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        game: true,
        product: true,
        user: {
          select: { username: true }
        }
      }
    });

    if (!order || !order.contactEmail) {
      console.log(`[Email] Order ${orderId} not found or has no email.`);
      return { success: false, error: "No email found" };
    }

    const gameName = order.game?.name || "Unknown Game";
    const productName = order.product?.name || order.serviceType;
    const userName = order.user?.username || "Pelanggan";

    // Get Logo from Settings
    const settings = await prisma.globalSetting.findMany({
      where: { key: { in: ["SITE_LOGO", "SITE_NAME"] } }
    });
    const logoUrl = settings.find(s => s.key === "SITE_LOGO")?.value || "https://carenpedia.com/logo.png";
    const siteName = settings.find(s => s.key === "SITE_NAME")?.value || "CarenPedia";

    const rupiah = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f7; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #0f172a; padding: 30px; text-align: center; color: #fff; }
          .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
          .content { padding: 40px; }
          .invoice-title { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 5px; }
          .invoice-no { color: #64748b; font-size: 14px; margin-bottom: 30px; }
          .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .summary-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
          .label { color: #64748b; font-size: 14px; }
          .value { text-align: right; font-weight: 600; color: #0f172a; }
          .total-row { background: #f8fafc; }
          .total-row td { border-bottom: none; padding: 15px 12px; }
          .total-label { font-size: 16px; font-weight: 700; color: #0f172a; }
          .total-value { font-size: 18px; font-weight: 800; color: #2563eb; text-align: right; }
          .footer { background: #f8fafc; padding: 25px; text-align: center; font-size: 12px; color: #94a3b8; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 20px; }
          .status-paid { background: #dcfce7; color: #166534; }
          .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="${siteName}" class="logo" />
            <div style="font-size: 14px; opacity: 0.8;">Bukti Pembayaran Digital</div>
          </div>
          <div class="content">
            <div class="status-badge status-paid">Lunas / Paid</div>
            <div class="invoice-title">Terima Kasih, ${userName}!</div>
            <p style="margin-top: 0; color: #64748b;">Pesanan Anda telah berhasil diproses. Simpan email ini sebagai bukti transaksi Anda.</p>
            <div class="invoice-no">Order ID: <b>${order.orderNo}</b> • ${new Date(order.paidAt || order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            
            <table class="summary-table">
              <tr>
                <td class="label">Game</td>
                <td class="value">${gameName}</td>
              </tr>
              <tr>
                <td class="label">Item</td>
                <td class="value">${productName}</td>
              </tr>
              <tr>
                <td class="label">User ID</td>
                <td class="value">${order.inputUserId} ${order.inputServer ? `(${order.inputServer})` : ''}</td>
              </tr>
              <tr>
                <td class="label">Metode Pembayaran</td>
                <td class="value">${order.paymentGateway ? `${order.paymentGateway} (${order.gatewayMethodKey})` : order.paymentMethod}</td>
              </tr>
              <tr class="total-row">
                <td class="total-label">Total Bayar</td>
                <td class="total-value">${rupiah(order.finalPayable)}</td>
              </tr>
            </table>

            <div style="text-align: center;">
              <p style="font-size: 13px; color: #64748b;">Punya kendala dengan pesanan Anda?</p>
              <a href="https://wa.me/628123456789" class="btn">Hubungi Customer Service</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.<br/>
            Email ini dikirimkan secara otomatis, mohon tidak membalas email ini.
          </div>
        </div>
      </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "CarenPedia <noreply@carenpedia.com>",
      to: [order.contactEmail],
      subject: `[LUNAS] Invoice ${order.orderNo} - ${gameName}`,
      html: html,
    });

    console.log(`[Email] Invoice sent to ${order.contactEmail} for order ${order.orderNo}`);
    return { success: true, data };
  } catch (error) {
    console.error(`[Email] Failed to send invoice:`, error);
    return { success: false, error };
  }
}
