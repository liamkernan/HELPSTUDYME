// src/components/Footer.js
import React from "react";

function Footer() {
    return (
        <footer className="bg-blue-800 p-4 text-center text-white mt-10">
            <p>© {new Date().getFullYear()} (helpstudy.me) by Liam Kernan</p>
            <br />
            <p className="text-sm"> All AI-generated content is created using OpenAI’s language models and is subject to OpenAI’s Terms of Use. This site is not affiliated with or endorsed by OpenAI or CollegeBoard. © OpenAI. All rights reserved.</p>
        </footer>
    );
}

export default Footer;