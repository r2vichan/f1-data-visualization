import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo-title-container" style={{paddingLeft:30}}>
        <img src={`${process.env.PUBLIC_URL}/f1.png`} alt="F1 Logo" className="logo" />
        <h1 className="navbar-title">Formula 1: Speed vs Safety</h1>
      </div>
      <div className="nav-links">
      <NavLink
          to="/"
          className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}
        >
          Home
        </NavLink>
        {/* <NavLink
          to="/idiom1"
          className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}
        >
          Idiom 1
        </NavLink>
        <NavLink
          to="/idiom2"
          className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}
        >
          Idiom 2
        </NavLink>
        <NavLink
          to="/idiom3"
          className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}
        >
          Idiom 3
        </NavLink>
        <NavLink
          to="/idiom4"
          className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}
        >
          Idiom 4
        </NavLink>
        <NavLink
          to="/idiom5"
          className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}

          style={{paddingRight:30}}
        >
          Idiom 5
        </NavLink> */}
      </div>
    </nav>
  );
}

export default Navbar;
