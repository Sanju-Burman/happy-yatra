// src/components/Footer.jsx
import React from "react";
import "../../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h4>Navigation</h4>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/news">News</a>
      </div>

      <div className="footer-logo">
        <h2>Happy Yatra</h2>
        <p className="tagline">Your next destination awaits.</p>
        <div className="footer-socials">
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
        </div>
      </div>

      <div className="footer-section right">
        <h4>Contact</h4>
        <p>Email: support@destiny.com</p>
        <p>Phone: +91 98765 43210</p>
      </div>
    </footer>
  );
};

export default Footer;
