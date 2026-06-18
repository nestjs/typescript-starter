export type Address = {
    street: string
    houseNumber: string
    rest: string
}

/**
 * Splits address into street / houseNumber / rest.
 * Supports Norwegian and English letters (ÆØÅ/æøå), ranges (12-14),
 * fractions (35/2), suffixes (10B).
 */
export function splitAddress(input: string): Address {
    const raw = (input ?? '').trim().replace(/\s+/g, ' ')
    const LETTERS = 'A-Za-zÆØÅæøå'
    const streetPart = `[${LETTERS}][${LETTERS}\\s\\.\\-]*`
    const numberPart = `\\d{1,5}[${LETTERS}]?(?:[\\/\\-–]\\s*\\d{1,5}[${LETTERS}]?)?`

    const reStreetFirst = new RegExp(
        `^(?<street>${streetPart})\\s+(?<number>${numberPart})(?:[ ,;]+(?<rest>.*))?$`,
        'u',
    )
    const reNumberFirst = new RegExp(
        `^(?<number>${numberPart})\\s+(?<street>${streetPart})(?:[ ,;]+(?<rest>.*))?$`,
        'u',
    )

    let street = raw, houseNumber = '', rest = ''

    let m = raw.match(reStreetFirst)
    if (m?.groups) {
        street = m.groups.street.trim()
        houseNumber = m.groups.number.trim()
        rest = (m.groups.rest ?? '').trim()
    } else {
        m = raw.match(reNumberFirst)
        if (m?.groups) {
            street = m.groups.street.trim()
            houseNumber = m.groups.number.trim()
            rest = (m.groups.rest ?? '').trim()
        }
    }

    return { street, houseNumber, rest }
}

export function normalizeAddress(addressOne: string, addressTwo: string): Address {
    const a1 = (addressOne ?? '').trim()
    const a2 = (addressTwo ?? '').trim()

    let { street, houseNumber } = splitAddress(a1)
    let rest: string = a2 || ''

    if (!houseNumber && a2) {
        const onlyNumberLike = /^\d{1,5}[A-Za-zÆØÅæøå]?(?:[\/\-–]\s*\d{1,5}[A-Za-zÆØÅæøå]?)?$/u
        if (onlyNumberLike.test(a2)) {
            houseNumber = a2
            rest = ''
        }
    }

    return { street, houseNumber, rest }
}
