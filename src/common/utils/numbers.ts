type Row = {
    createInvoice: boolean
    accountAmount?: string | null
}

// головна функція
export function sumInvoiceAccountAmounts(rows: Row[]) {
    const items = rows.filter(r => r.createInvoice)
    const total = items.reduce((acc, r) => acc + toNumber(r.accountAmount), 0)
    const totalRounded = Math.round(total * 100) / 100

    return { items, total, totalRounded }
}

function toNumber(v?: string | null): number {
    if (!v) return 0
    const raw = String(v).trim()
    if (!raw) return 0

    const quick = Number(raw.replace(',', '.'))
    if (!Number.isNaN(quick)) return quick

    const sanitized = raw
        .replace(/[^0-9+\-*/()., ]/g, '')
        .replace(/,/g, '.')

    try {
        const res = Function(`"use strict"; return (${sanitized});`)()

        return typeof res === 'number' && Number.isFinite(res) ? res : 0
    } catch {
        return 0
    }
}
