import { ReactNode, memo, useLayoutEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "src/store/slice/app.slice";

interface IProps {
  title: string;
  children: ReactNode;
}

export const PageTitleHOC = memo(({ title, children }: IProps) => {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(setPageTitle(title));
  }, [dispatch, title]);

  return <>{children}</>;
});
