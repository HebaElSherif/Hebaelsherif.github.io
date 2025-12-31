<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>My Landing Page</title>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }

    body {
      background: linear-gradient(135deg, #4f46e5, #3b82f6);
      color: white;
      min-height: 100vh;
    }

    header {
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    header h1 {
      font-size: 24px;
    }

    nav a {
      color: white;
      text-decoration: none;
      margin-left: 20px;
      font-weight: bold;
    }

    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 100px 20px;
    }

    .hero h2 {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .hero p {
      max-width: 600px;
      font-size: 18px;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    .hero button {
      padding: 15px 30px;
      font-size: 16px;
      border: none;
      border-radius: 30px;
      background: white;
      color: #3b82f6;
      cursor: pointer;
      font-weight: bold;
    }

    .hero button:hover {
      background: #e5e7eb;
    }

    footer {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      opacity: 0.8;
    }

    @media (max-width: 600px) {
      .hero h2 {
        font-size: 36px;
      }
    }
  </style>
</head>

<body>

  <header>
    <h1>MyBrand</h1>
    <nav>
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </nav>
  </header>

  <section class="hero">
    <h2>Welcome to My Landing Page</h2>
    <p>
      This is a simple landing page you can use for a project, startup,
      portfolio, or idea. Customize it however you like!
    </p>
    <button onclick="alert('Thanks for clicking!')">
      Get Started
    </button>
  </section>

  <footer>
    © 2025 MyBrand. All rights reserved.
  </footer>

</body>
</html>
