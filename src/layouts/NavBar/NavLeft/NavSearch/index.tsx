import React, { Component, useEffect, useState } from "react";
// import windowSize from "react-window-size";

// import { connect } from "react-redux";
// interface INavSearchProps extends React.HTMLAttributes<Element> {
//   fullWidthLayout?: any;
// }
// type NavSearchState = {
//   isOpen?: boolean
// };
const NavSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mainSearchClass, setMainSearchClass] = useState(["position-relative"]);
  useEffect(() => {
    if (true) {
      setMainSearchClass([...mainSearchClass, "container-fluid"]);
    }
  }, []);
  // render() {
  //   let mainSearchClass = ["position-relative"];
  //   if (this.props.fullWidthLayout) {
  //     mainSearchClass = [...mainSearchClass, "container-fluid"];
  //   } else {
  //     mainSearchClass = [...mainSearchClass, "container"];
  //   }
  //   let searchContent: React.ReactNode = "";
  //   if (this.state.isOpen) {
  //     searchContent = (

  //     );
  //   }

  // }
  return (
    <>
      {isOpen && (
        <div className="search-bar open">
          <div className={mainSearchClass.join(" ")}>
            <input
              type="text"
              className="form-control border-0 shadow-none"
              placeholder="Search here"
            />
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
            >
              <span aria-hidden="true">
                <i className="feather icon-x" />
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default NavSearch;
// export default windowSize(NavSearch as any)
