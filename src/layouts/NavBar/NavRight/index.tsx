/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLazySignOutQuery } from "../../../store/api/authApi";
import { useNavigate } from "react-router-dom";
import Link from "antd/es/typography/Link";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
const NavRight = () => {
  const [signOut, { isSuccess }] = useLazySignOutQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user }: any = useSelector<any>(state => state.auth);
  const handleLogout = () => {
    signOut({});
  };
  useEffect(() => {
    if (isSuccess) {
      localStorage.clear();
      navigate("/signin", { replace: true });
    }
  }, [isSuccess]);
  return (
    <>
      <ul className="navbar-nav ml-auto">
        <li>
          <Dropdown className="drp-user">
            <Dropdown.Toggle as="a" variant="link" id="dropdown-basic">
              <Avatar shape="square" icon={<UserOutlined />} style={{ cursor: "pointer" }} />
            </Dropdown.Toggle>
            <Dropdown.Menu alignRight className="profile-notification">
              <div className="pro-head">
                <Avatar shape="square" icon={<UserOutlined />} />
                <span>{` ${user?.user_name}`}</span>
                <Link onClick={handleLogout} className="dud-logout" title="Logout">
                  <i className="feather icon-log-out" />
                </Link>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </li>
      </ul>
    </>
  );
};
export default NavRight;
