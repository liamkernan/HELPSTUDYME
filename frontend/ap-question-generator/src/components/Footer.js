import React from "react";

function Footer() {
    return (
        <footer className="bg-gray-900 p-3 text-center text-white mt-10">
            <p className="">© {new Date().getFullYear()} <i>(helpstudy.me)</i> by Liam Kernan</p>
            <p className="text-sm mt-1"> All AI-generated content is created using OpenAI's language models and is subject to OpenAI's Terms of Use. This site is not affiliated with or endorsed by OpenAI or CollegeBoard. © OpenAI. All rights reserved.</p>
        </footer>
    );
}

export default Footer;