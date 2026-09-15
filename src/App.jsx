// app.js
const express = require('express');
const app = express();
const port = 3000;

// Route for homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>App.js Demo</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          header {
            background: #333;
            color: #fff;
            padding: 20px;
            text-align: center;
          }
          main {
            padding: 20px;
          }
          button {
            background: #007BFF;
            color: #fff;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 4px;
          }
          button:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Hello from app.js</h1>
        </header>
        <main>
          <p>This page is served entirely from <code>app.js</code>.</p>
          <button onclick="alert('Button clicked!')">Click Me</button>
        </main>
      </body>
    </html>
  `);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
