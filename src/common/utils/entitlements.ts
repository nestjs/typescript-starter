export function getEntitlementValue(
    entitlements: string[] | undefined,
    type: string,
): string | undefined {
    if (!entitlements) return undefined;

    for (const raw of entitlements) {
        try {
            const e = JSON.parse(raw) as {
                value: string;
                type: string;
            };
            if (e.type === type) {
                return e.value;
            }
        } catch {
            continue;
        }
    }

    return undefined;
}
