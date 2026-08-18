/**
 * Browser Print Utility (Standard HTML / PDF Print)
 * Optimized for 58mm thermal receipt printer (~44mm printable width).
 * Uses sans-serif font for narrower characters to prevent right-side clipping.
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
    "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(value || 0));

  // Build items HTML - receipt style (name on first line, qty x price = subtotal on second line)
  const itemsHtml = (transaction.transactionItems || [])
    .map((it: any) => {
      const name = it.product?.name || "Produk";
      const qty = it.quantity || 1;
      const price = it.soldPrice || 0;
      const subtotal = it.subtotal || price * qty;
      return `
        <div class="item">
          <div class="item-name">${name}</div>
          <div class="item-detail">
            <span>${qty} x ${formatCurrency(price)}</span>
            <span class="item-subtotal">${formatCurrency(subtotal)}</span>
          </div>
        </div>
      `;
    })
    .join("");

  const tDate = transaction.createdAt
    ? formatDate(transaction.createdAt) + " " + formatTime(transaction.createdAt)
    : "";

  const trxId = transaction.id ? `TRX-${transaction.id}` : "";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Struk Pembayaran</title>
        <style>
          @page {
            size: auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            width: 100%;
            margin: 0;
            padding: 0;
            font-size: 7px;
            color: #000;
            line-height: 1.25;
            word-wrap: break-word;
            overflow-wrap: break-word;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .receipt {
            width: 100%;
            max-width: 48mm;
            padding: 1mm 6.5mm 1mm 1mm;
            margin-left: 0;
            margin-right: auto;
          }
          .header {
            text-align: center;
            padding-bottom: 2px;
            border-bottom: 1px dashed #000;
            margin-bottom: 2px;
          }
          .logo {
            display: block;
            margin: 0 auto 3px auto;
            max-height: 42px;
            width: auto;
            object-fit: contain;
          }
          .store-name {
            font-size: 8px;
            font-weight: 900;
            white-space: nowrap;
            letter-spacing: -0.1px;
          }
          .store-subtitle {
            font-size: 6px;
            color: #333;
          }
          .info {
            text-align: center;
            font-size: 6px;
            color: #333;
            padding: 2px 0;
            border-bottom: 1px dashed #000;
            margin-bottom: 2px;
          }
          .info div {
            margin: 1px 0;
          }
          .item {
            margin-bottom: 2px;
          }
          .item-name {
            font-weight: 700;
            font-size: 6.5px;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .item-detail {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 5.8px;
            padding-left: 1.5px;
          }
          .item-detail span {
            white-space: nowrap;
          }
          .item-subtotal {
            font-weight: 700;
            text-align: right;
            white-space: nowrap;
          }
          .summary {
            border-top: 1px dashed #000;
            padding-top: 2px;
            margin-top: 2px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 7px;
            padding: 1px 0;
          }
          .summary-row.total {
            font-size: 8px;
            font-weight: 900;
            padding: 2px 0;
            border-bottom: 1px dashed #000;
            margin-bottom: 2px;
          }
          .summary-row .label {
            font-weight: 600;
            white-space: nowrap;
          }
          .summary-row .value {
            font-weight: 700;
            text-align: right;
            white-space: nowrap;
          }
          .footer {
            text-align: center;
            border-top: 1px double #000;
            padding-top: 2px;
            margin-top: 3px;
            font-size: 6px;
          }
          .footer .thanks {
            font-weight: 700;
            font-size: 7px;
            margin-bottom: 1px;
          }
          .footer .note {
            font-size: 5.5px;
            color: #444;
          }
          .feed {
            height: 5mm;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
        <div class="header">
          <img src="${logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'" />
          <div class="store-name">MEGA ELEKTRONIK</div>
          <div class="store-subtitle">Nota Pembayaran Toko</div>
        </div>
        <div class="info">
          ${tDate ? `<div>${tDate}</div>` : ""}
          ${trxId ? `<div>No: ${trxId}</div>` : ""}
        </div>
        <div class="items">
          ${itemsHtml}
        </div>
        <div class="summary">
          <div class="summary-row total">
            <span class="label">TOTAL</span>
            <span class="value">${formatCurrency(transaction.totalAmount)}</span>
          </div>
          ${
            transaction.paidAmount != null && Number(transaction.paidAmount) > 0
              ? `
            <div class="summary-row">
              <span class="label">BAYAR</span>
              <span class="value">${formatCurrency(transaction.paidAmount)}</span>
            </div>
            <div class="summary-row">
              <span class="label">KEMBALI</span>
              <span class="value">${formatCurrency(Math.max(0, transaction.paidAmount - transaction.totalAmount))}</span>
            </div>
          `
              : ""
          }
        </div>
        <div class="footer">
          <div class="thanks">Terima Kasih!</div>
          <div class="note">Barang yang sudah dibeli tidak dapat ditukar / dikembalikan.</div>
        </div>
        <div class="feed"></div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
