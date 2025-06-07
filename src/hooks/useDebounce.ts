import { useEffect, useState } from "react";

interface Props<T> {
  value: T;
  delay?: number;
}

export const useDebounce = <T>({ value, delay = 500 }: Props<T>) => {
  const [innerValue, setInnerValue] = useState(value);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (value !== innerValue)
      timerId = setTimeout(() => {
        setInnerValue(value);
      }, delay);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [value, delay, innerValue]);

  return innerValue;
};
