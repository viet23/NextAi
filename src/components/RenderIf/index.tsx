const RenderIf = ({ children, condition }: any) => {
  return condition ? children : null;
};
export default RenderIf;
