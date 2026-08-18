/**
 * Browser Print Utility (Standard HTML / PDF Print)
 * Used for Desktop, Android, and fallback printing on iOS.
 */

export function printBrowserReceipt(transaction: any): void {
  if (typeof window === "undefined" || !transaction) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Mohon izinkan pop-up window untuk mencetak struk.");
    return;
  }

  const logoUrl = `${window.location.origin}/logo.png`;

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const itemsHtml = (transaction.transactionItems || [])
    .map(
      (it: any) => `
        <tr>
          <td style="padding: 10px 8px; font-weight: 600; text-align: left;">${it.product?.name || "Produk"}</td>
          <td style="text-align: center; padding: 10px 8px; width: 90px;">${it.quantity}</td>
          <td style="text-align: right; padding: 10px 8px; width: 160px;">${formatCurrency(it.soldPrice)}</td>
          <td style="text-align: right; padding: 10px 8px; width: 160px; font-weight: 700;">${formatCurrency(it.subtotal)}</td>
        </tr>
      `
    )
    .join("");

  const tDate = transaction.createdAt
    ? formatDate(transaction.createdAt) + " " + formatTime(transaction.createdAt)
    : "";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Struk Pembayaran - MEGA ELEKTRONIK</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 12mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            width: 100%;
            margin: 0;
            padding: 0;
            font-size: 13px;
            color: #111;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid #111;
          }
          .logo {
            display: block;
            margin: 0 auto 8px auto;
            max-height: 70px;
            width: auto;
            object-fit: contain;
          }
          .header h2 {
            margin: 0 0 4px 0;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .header .subtitle {
            margin: 0 0 4px 0;
            font-size: 13px;
            color: #444;
            font-weight: 600;
          }
          .header .date {
            margin: 0;
            font-size: 12px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 13px;
          }
          thead th {
            border-top: 1px solid #111;
            border-bottom: 2px solid #111;
            padding: 10px 8px;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 800;
            background-color: #f8fafc;
          }
          tbody td {
            border-bottom: 1px solid #e2e8f0;
          }
          .summary-section {
            margin-top: 16px;
            border-top: 2px solid #111;
            padding-top: 10px;
            width: 100%;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 8px;
            font-size: 14px;
          }
          .summary-row.total {
            font-size: 18px;
            font-weight: 900;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 8px;
            margin-bottom: 6px;
          }
          .divider {
            border-top: 1px dashed #94a3b8;
            margin: 16px 0 12px 0;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            margin-top: 20px;
            color: #555;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoUrl}" alt="Logo Mega Elektronik" class="logo" onerror="this.style.display='none'" />
          <h2>MEGA ELEKTRONIK</h2>
          <p class="subtitle">Nota Pembayaran Toko</p>
          <p class="date">${tDate}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Nama Produk</th>
              <th style="text-align: center; width: 90px;">Qty</th>
              <th style="text-align: right; width: 160px;">Harga Satuan</th>
              <th style="text-align: right; width: 160px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="summary-section">
          <div class="summary-row total">
            <span>TOTAL PEMBAYARAN</span>
            <span>${formatCurrency(transaction.totalAmount)}</span>
          </div>
          ${
            transaction.paidAmount != null
              ? `
            <div class="summary-row">
              <span style="color: #475569; font-weight: 600;">JUMLAH BAYAR</span>
              <span style="font-weight: 700;">${formatCurrency(transaction.paidAmount)}</span>
            </div>
            <div class="summary-row">
              <span style="color: #ea580c; font-weight: 700;">KEMBALIAN</span>
              <span style="font-weight: 800; color: #ea580c;">${formatCurrency(transaction.paidAmount - transaction.totalAmount)}</span>
            </div>
          `
              : ""
          }
        </div>
        <div class="divider"></div>
        <div class="footer">
          <p style="margin: 4px 0; font-weight: 700;">Terima Kasih Atas Kunjungan Anda!</p>
          <p style="margin: 0; font-size: 11px; color: #64748b;">Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
