export const THOUSAND_SEPARATOR = ",";
export const DECIMAL_SEPARATOR = ".";

export const formatNumber = (n: number | string): string => {
  switch (typeof n) {
    case "number":
    case "string": {
      let [intPart, decimalPart] = n.toString().split(".");
      intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSAND_SEPARATOR);
      if (decimalPart) {
        decimalPart = decimalPart.replace(/0+$/, "");
        if (decimalPart === "") return intPart;
        return `${intPart}${DECIMAL_SEPARATOR}${decimalPart}`;
      }
      return intPart;
    }

    default:
      return "0";
  }
};
