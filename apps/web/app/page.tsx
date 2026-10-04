export default function Home() {
  return (
    <main className="shell">
      <nav className="nav"><span className="mark">R</span><span>rallx</span><span className="nav-label">WEALTH</span></nav>
      <section className="hero">
        <p className="eyebrow">YOUR MONEY, IN PERSPECTIVE</p>
        <h1>A clearer view<br />of your wealth.</h1>
        <p className="intro">Track what you earn, spend, own, and owe. Rallx brings your financial picture together, with privacy at its core.</p>
        <a className="button" href="#about">Explore Rallx <span aria-hidden="true">↗</span></a>
      </section>
      <section className="preview" id="about" aria-label="Product preview">
        <div className="preview-top"><span>YOUR OVERVIEW</span><span>THIS MONTH <b>⌄</b></span></div>
        <p className="balance-label">Total net worth</p><p className="balance">₹ 24,86,450</p>
        <p className="change">↗ 8.4% <span>compared to last month</span></p>
        <div className="bars" aria-hidden="true">{[30, 42, 38, 52, 48, 61, 55, 67, 65, 74, 70, 90].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
        <div className="preview-foot"><span>ASSETS <b>₹ 31,42,800</b></span><span>LIABILITIES <b>₹ 6,56,350</b></span></div>
      </section>
      <footer>Built for a more confident relationship with money.</footer>
    </main>
  );
}
