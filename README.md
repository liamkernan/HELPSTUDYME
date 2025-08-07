<h2 className="text-4xl font-extrabold mb-4">About the Project</h2>
                <p className="pt-5 mb-2">
                    <strong>helpstudy.me</strong> is an AI-powered study companion built
                    to generate unlimited practice questions, deliver instant feedback,
                    and track your progress—completely free.
                </p>
                <p className="mb-9">
                    Under the hood, it’s a React front-end with KaTeX for rigid
                    math rendering, talking to a back-end that proxies to OpenAI’s
                    API to not only craft questions across AP, SAT, ACT, and any other “quiz”
                    you want to master, but also provide feedback on Free Response writing, and offer studying priorites based on multiple choice responses and accuracy. Firebase is used for user authentication and to perserve student progress, regardless of where or what device your accessing from.
                </p>
                <p className={"mb-20"}>
                    Created by Liam Kernan to help fellow
                    students study not just <b>harder</b>, but <b>smarter</b>.
                </p>

<h2 className="text-3xl font-bold mt-10 mb-4">Installation</h2>
<p className="pt-3 mb-2">
  <strong>Prerequisites:</strong> Node.js ≥14, Java 17+, Maven, Firebase CLI
</p>
<ol className="list-decimal list-inside mb-9">
  <li>Clone the repo:<br/><code>git clone https://github.com/liamkernan/HELPSTUDYME.git</code></li>
  <li>Install client dependencies:<br/><code>cd HELPSTUDYME/client && npm install</code></li>
  <li>Build server:<br/><code>cd ../server && mvn clean install</code></li>
  <li>Create environment variables:<br/><code>OPENAI_API_KEY</code>, <code>REACT_APP_FIREBASE_API_KEY</code>, <code>REACT_APP_API_BASE</code> in <code>.env</code> files</li>
  <li>Start frontend:<br/><code>cd frontend/ap-question-generator, npm start</code> (in <code>/client</code>)</li>
  <li>Start backend:<br/><code>cd backend, mvn spring-boot:run</code> (in <code>/server</code>)</li>
</ol>

<h2 className="text-3xl font-bold mt-10 mb-4">Usage</h2>
<p className="mb-9">
  Navigate to <code>http://localhost:3000</code>, sign in with Firebase, select a question type, and generate your practice questions instantly.
</p>

<h2 className="text-3xl font-bold mt-10 mb-4">Features</h2>
<ul className="list-disc list-inside mb-9">
  <li>Generate multiple‑choice and free‑response questions on-demand</li>
  <li>Render complex math expressions with KaTeX</li>
  <li>Responsive, modern UI styled with Tailwind CSS</li>
  <li>Authentication, user data, and real‑time updates via Firebase</li>
  <li>simple-openAI API proxy for prompt management</li>
</ul>

<h2 className="text-3xl font-bold mt-10 mb-4">Built With</h2>
<p className="mb-9">
  <code>JavaScript</code>, <code>Java</code>, <code>Node.js</code>, <code>React</code>, <code>Spring Boot</code>, <code>simple-openai-api</code>, <code>Firebase</code>, <code>KaTeX</code>, <code>Tailwind CSS</code>
</p>

<h2 className="text-3xl font-bold mt-10 mb-4">Contributing</h2>
<p className="mb-9">
  Contributions are welcome! Fork the repository, create a feature branch, commit your changes, and open a pull request.
</p>

<h2 className="text-3xl font-bold mt-10 mb-4">License</h2>
<p className="mb-20">
  This project is licensed under the <strong>MIT License;</strong> more information can be found in LICENSE.txt at the project root.
</p>

