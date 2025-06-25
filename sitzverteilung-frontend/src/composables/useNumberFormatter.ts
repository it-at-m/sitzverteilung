export function useNumberFormatter(number:number) {
    return new Intl.NumberFormat('de-DE', {
        useGrouping: true
    }).format(number)
}