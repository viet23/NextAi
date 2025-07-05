import React, { Component } from "react";
import { connect } from "react-redux";
interface IOutsideClickProps extends React.HTMLAttributes<Element> {
  collapseMenu?: any;
  windowWidth?: any;
  onToggleNavigation?: any;
}
class OutsideClick extends Component<IOutsideClickProps, {}> {
  wrapperRef: any;
  constructor(props: IOutsideClickProps) {
    super(props);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }
  componentDidMount() {
    document.addEventListener("mousedown", this.handleOutsideClick);
  }
  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleOutsideClick);
  }
  setWrapperRef(node: any) {
    this.wrapperRef = node;
  }
  /**
   * close menu if clicked on outside of element
   */
  handleOutsideClick(event: any) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      if (this.props.windowWidth < 992 && this.props.collapseMenu) {
        this.props.onToggleNavigation();
      }
    }
  }
  render() {
    return (
      <div className="nav-outside" ref={this.setWrapperRef}>
        {this.props.children}
      </div>
    );
  }
}
export default OutsideClick;
