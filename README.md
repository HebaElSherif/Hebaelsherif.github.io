<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Brand — Official</title>

  <!-- Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #0b0d12;
      --card: rgba(255,255,255,0.06);
      --border: rgba(255,255,255,0.12);
      --text: #f9fafb;
      --muted: #9ca3af;
      --accent: #6366f1;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
    }

    body {
      background: radial-gradient(1200px 600px at 50% -20%, #1e1b4b 0%, transparent 60%), var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* NAV */
    nav {
      position: sticky;
      top: 0;
      backdrop-filter: blur(10px);
      background: rgba(11,13,18,0.7);
      border-bottom: 1px solid var(--border);
      z-index: 10;
    }

    .nav-container {
      max-width: 1200px;
      margin: auto;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.5px;
    }

    .nav-links a {
      color: var(--muted);
      text-decoration: none;
      margin-left: 30px;
      font-weight: 500;
      transition: color 0.3s;
    }

    .nav-links a:hover {
      color: var(--text);
    }

    /* HERO */
    .hero {
      max-width: 1200px;
      margin: auto;
      padding: 120px 20px 80px;
      text-align: center;
    }

    .badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 999px;
      background: var(--card);
      border: 1px solid var(--border);
      font-size: 14px;
      color: var(--muted);
      margin-bottom: 30px;
    }

    .hero h1 {
      font-size: clamp(42px, 6vw, 72px);
      font-weight: 900;
      line-height: 1.05;
      margin-bottom: 25px;
      letter-spacing: -2px;
    }

    .hero p {
      max-width: 650px;
      margin: auto;
      font-size: 18px;
      color: var(--muted);
      line-height: 1.7;
    }

    .cta {
      margin-top: 50px;
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 16px 32px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--text);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn.primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    /* FEATURES */
    .features {
      max-width: 1200px;
      margin: 80px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 30px;
    }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 30px;
      transition: transform 0.3s ease;
    }

    .card:hover {
      transform: translateY(-6px);
    }

    .card h3 {
      margin-bottom: 12px;
      font-size: 20px;
    }

    .card p {
      color: var(--muted);
      line-height: 1.6;
    }

    /* FOOTER */
    footer {
      border-top: 1px solid var(--border);
      padding: 40px 20px;
      text-align: center;
      color: var(--muted);
      font-size: 14px;
    }
  </style>
</head>

<body>

  <nav>
    <div class="nav-container">
      <div class="logo">YOURBRAND</div>
      <div class="nav-links">
        <a href="#">Product</a>
        <a href="#">Company</a>
        <a href="#">Contact</a>
      </div>
    </div>
  </nav>

  <section class="hero">
    <div class="badge">Premium Digital Brand</div>
    <h1>Design. Power. Precision.</h1>
    <p>
      We build high-performance digital experiences for brands that
      care about quality, detail, and long-term impact.
    </p>

    <div class="cta">
      <button class="btn primary">Get Started</button>
      <button class="btn">View Work</button>
    </div>
  </section>

  <section class="features">
    <div class="card">
      <h3>Elite Design</h3>
      <p>Minimal, timeless interfaces crafted to elevate your brand.</p>
    </div>

    <div class="card">
      <h3>Performance First</h3>
      <p>Optimized for speed, accessibility, and modern standards.</p>
    </div>

    <div class="card">
      <h3>Built to Scale</h3>
      <p>Clean architecture ready to grow with your business.</p>
    </div>
  </section>

  <footer>
    © 2025 YOURBRAND. Crafted with precision.
  </footer>

</body>
</html>
