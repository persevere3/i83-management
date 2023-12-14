export function useNumberFormat() {
  const thousandsSeparatorFormat = (number: number) => {
    return (
      "$" +
      number.toString().replace(/\d+/, function (num: string) {
        return num.replace(/(\d)(?=(\d{3})+$)/g, function (n: string) {
          return n + ","
        })
      })
    )
  }

  return {
    thousandsSeparatorFormat
  }
}
