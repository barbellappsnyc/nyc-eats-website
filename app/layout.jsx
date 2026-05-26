import Script from 'next/script';

export const metadata = {
  title: 'NYC Eats: Gourmet Passports',
  description: 'Curated spots in NYC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=EB+Garamond:wght@400;800&display=swap');
          :root { --garamond: 'AppleGaramond', 'EB Garamond', Garamond, serif; --courier: 'Courier Prime', Courier, monospace; }
          body, html { margin: 0; padding: 0; background-color: #050505; color: white; overflow: hidden; font-family: var(--garamond); }
          #bokeh-canvas { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none; }
          .glass-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.20); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 1; pointer-events: none; }
          .phrase-container { text-align: center; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; opacity: 0; z-index: 2; }
          .typing-text { font-size: 42px; letter-spacing: 1.2px; margin: 0; }
          .cursor { font-weight: 300; animation: blink 1s step-end infinite; }
          .translation { font-family: var(--courier); font-size: 12px; font-weight: bold; letter-spacing: 4.0px; color: rgba(255, 255, 255, 0.54); margin-top: 16px; opacity: 0; }
          .logo-container { text-align: center; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; opacity: 0; visibility: hidden; z-index: 2; }
          .logo-title { font-size: 48px; font-weight: 900; letter-spacing: 6.0px; margin: 0 0 12px 0; }
          .logo-subtitle { font-family: var(--courier); font-size: 14px; font-weight: bold; letter-spacing: 8.0px; color: rgba(255, 255, 255, 0.6); margin: 0 0 40px 0; }
          .app-store-btn { display: inline-block; width: 200px; transition: transform 0.2s ease; cursor: pointer; }
          .app-store-btn:hover { transform: scale(1.05); }
          .footer { position: fixed; bottom: 20px; width: 100%; text-align: center; font-family: var(--garamond); font-size: 12px; color: rgba(255, 255, 255, 0.4); z-index: 10; }
          .footer a { color: rgba(255, 255, 255, 0.4); text-decoration: none; margin: 0 10px; transition: color 0.2s; }
          .footer a:hover { color: white; }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        `}} />
      </head>
      <body>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/TextPlugin.min.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
