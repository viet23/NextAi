import { Tooltip } from "antd";
import Paragraph, { ParagraphProps } from "antd/es/typography/Paragraph";
import { ReactNode, useState } from "react";

type Props = ParagraphProps & {
  children: ReactNode;
};

export const TooltipParagraph = ({
  children,
  ellipsis,
  ...otherProps
}: Props) => {
  const [truncated, setTruncated] = useState(false);

  return (
    <Tooltip title={truncated ? children : undefined}>
      <Paragraph {...otherProps} ellipsis={{ onEllipsis: setTruncated }}>
        {children}
      </Paragraph>
    </Tooltip>
  );
};
