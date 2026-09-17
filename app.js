// cPanel's Node.js Application manager commonly expects an app.js startup file.
// The production server owns the listener and uses cPanel's PORT environment variable.
import('./server.mjs').catch((error) => {
  console.error('Career Minute could not start.', error)
  process.exit(1)
})
