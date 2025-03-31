// src/components/Footer.js
import React from "react";

function Footer() {
    return (
        <footer className="bg-gray-100 p-4 text-center text-gray-600 mt-10">
            <p>© {new Date().getFullYear()} AP Question Generator</p>
        </footer>
    );
}

export default Footer;