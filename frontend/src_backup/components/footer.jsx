import React from "react";
import "../styles/footer.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h4>Quick Links</h4>
        <a href="/">Home</a>
        <a href="/yatra">My Yatra</a>
        <a href="/feedback">Feedback</a>
      </div>

      <div className="footer-logo">
        <img src="/logo.png" alt="Happy Yatraa Inc. Logo" height="60" />
        <p className="tagline">Yatra a good time.</p>
        <div className="footer-socials">
          <a href="#">
            <FaFacebookF />
          </a>
          <a href="#">
            <FaTwitter />
          </a>
          <a href="#">
            <FaInstagram />
          </a>
          <a href="#">
            <FaLinkedinIn />
          </a>
        </div>
      </div>

      <div className="footer-section right">
        <h4>About Us</h4>
        <p>
          A user-friendly platform that delivers personalized destination recommendations,
          helping users find their ideal travel spots based on their unique preferences and travel history.
        </p>
        <p>
          © 2025 Happy Yatraa
          <br />
          All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
