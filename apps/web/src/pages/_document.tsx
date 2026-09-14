import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Catch script loading errors (e.g. from cached HTML pointing to old Next.js chunks)
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  if (e.target && e.target.tagName === 'SCRIPT') {
                    var src = e.target.src;
                    if (src && src.includes('/_next/static/chunks/')) {
                      if (!sessionStorage.getItem('script_reloaded')) {
                        sessionStorage.setItem('script_reloaded', 'true');
                        window.location.reload(true);
                      }
                    }
                  }
                }, true); // Use capture phase because script error events don't bubble
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
