// src/utils/qr-utils.js

async function buildPayBySquareString({ iban, amount, vs, childName, notePrefix, recipientName }) {
    const { CurrencyCode, generate, PaymentOptions } = await import("bysquare");

    const cleanIban = (iban || "").replace(/\s+/g, "");
    const numericAmount = Number(amount || 0);


    const model = {

        payments: [
            {
                type: PaymentOptions.PaymentOrder,
                amount: numericAmount,
                currencyCode: CurrencyCode.EUR,
                bankAccounts: [{ iban: cleanIban }],
                variableSymbol: vs ? String(vs) : "",
                paymentNote,

                beneficiaryName: recipientName || "Materská škola Upeješko",
            },
        ],
    };

    const qrString = await generate(model);
    return qrString;
}

module.exports = { buildPayBySquareString };
