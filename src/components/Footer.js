// src/components/Footer.js
import React from "react";

function Footer() {
    return (
        <footer className="bg-blue-800 p-4 text-center text-white mt-10">
            <p>© {new Date().getFullYear()} (helpstudy.me) by Liam Kernan</p>
        </footer>
    );
}

export default Footer;