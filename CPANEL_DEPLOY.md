# Deploy Career Minute on cPanel

This project is a **Node.js application**, not a static-only website. The same Express server provides the public pages, orders, uploads, order tracking and the private admin workspace. Use this guide only on a cPanel plan that includes **Setup Node.js App / Node.js Selector** and SSH or Terminal access.

> A static-only cPanel plan cannot run the order, payment-verification or admin features. In that case, use a Node/Docker host instead.

## 1. Prepare the domain

At the time this guide was added, `careerminute.com` did not resolve in public DNS. Before testing on the main domain, do one of the following with the domain registrar:

- point the domain to the hosting provider's nameservers; or
- add the records supplied by the cPanel host, usually `A` for `@` to the server IP and `CNAME` for `www` to `careerminute.com`.

Then add `careerminute.com` in **cPanel → Domains**. DNS propagation can take time. Do not enable Force HTTPS Redirect until the certificate is issued.

## 2. Upload the project outside `public_html`

Use an application directory such as:

```text
/home/CPANEL_USER/career-minute
```

Do not place the application source, `.env`, `data/`, or uploaded customer files in `public_html`.

The easiest repeatable option is **cPanel → Git Version Control**:

1. Create or clone the repository into `career-minute`.
2. Select the `arena/01a0ab51-carreer` branch (or merge it to the branch you use for releases first).
3. Pull the latest code when deploying an update.

If Git access is unavailable, upload a ZIP of the repository source to `career-minute` and extract it there. Do not upload `node_modules`, `.env`, `data`, or the local `.git` directory.

## 3. Create the Node.js application

Open **cPanel → Setup Node.js App** and choose **Create Application**.

| Field | Value |
| --- | --- |
| Node.js version | Node 20 LTS or newer |
| Application mode | Production |
| Application root | `career-minute` |
| Application URL | `careerminute.com/` |
| Application startup file | `app.js` |

The `app.js` launcher is included specifically for cPanel application managers. It starts `server.mjs`, which automatically uses cPanel's `PORT` value. **Do not manually set `PORT`.**

## 4. Set production environment variables

In the Node.js App environment-variable screen (or in a private `.env` file in the application root), set:

```dotenv
NODE_ENV=production
ADMIN_PASSWORD=use-a-long-unique-admin-password
SESSION_SECRET=use-a-long-random-secret-at-least-32-characters
```

Generate a suitable session secret locally or from cPanel Terminal:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Optional email notifications require:

```dotenv
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM=Career Minute <notifications@your-verified-domain>
```

Never put these values in Git, `public_html`, a public document, or a browser-side JavaScript file.

## 5. Install and build

Click the cPanel-provided **Enter to virtual environment** command in Terminal. It normally looks similar to the command below, but use the exact command shown by cPanel:

```bash
source /home/CPANEL_USER/nodevenv/career-minute/20/bin/activate
cd /home/CPANEL_USER/career-minute
npm ci --include=dev
npm run build
mkdir -p data/uploads
chmod 700 data data/uploads
```

`npm run build` is required because `dist/` is generated from the source and is not committed to Git.

Restart the application in **Setup Node.js App** after the build. On later releases, pull the changes, run `npm ci --include=dev && npm run build`, then restart the app.

On its first start, the server creates a private `config/site-settings.json` from the included example. It publishes these user-approved methods:

- **bKash Personal — Send Money to `01962525107`**
- **Nagad Personal — Send Money to `01962525107`**

Payment submissions remain **Pending verification** until an authenticated admin approves them in `/admin/`.

## 6. Enable HTTPS

Once DNS points to the host:

1. Run **cPanel → SSL/TLS Status → Run AutoSSL**.
2. Confirm that `https://careerminute.com` opens without a certificate warning.
3. Enable **Domains → Force HTTPS Redirect**.

## 7. Deployment smoke tests

Run these after restarting the application:

```bash
curl -fsS https://careerminute.com/api/health
curl -fsS https://careerminute.com/api/settings
curl -fsSI https://careerminute.com/
```

Expected results:

- `/api/health` returns `{"status":"ok","service":"career-minute-api"}`.
- `/api/settings` includes enabled `bKash` and `Nagad` entries with account `01962525107`.
- `/` returns HTTP 200 and loads styling and images.

Then test manually in a private/incognito browser window:

1. Open `/`, `/en/`, `/order/`, and `/track-order/`.
2. Open `/admin/` and sign in with the production admin password.
3. Select bKash Personal or Nagad Personal on the order page. Check that the Send Money instruction and Transaction ID requirement appear.
4. Submit one clearly-labelled internal test request using a test email. It must show **Payment pending** until an admin changes it to **Approved / paid**.
5. Confirm that an unauthenticated browser cannot load `/api/admin/orders` or a payment-proof file.

## cPanel troubleshooting

- **Generic “Something went wrong” page:** run `npm run build`, then restart the Node app. This usually means the generated `dist/` directory is absent.
- **Application will not start:** check the cPanel Node application log; verify the selected startup file is `app.js`, Node is at least version 20, and dependencies are installed.
- **Orders or uploads disappear after a restart:** the `data/` directory is not persistent or writable. Keep `/home/CPANEL_USER/career-minute/data` outside the web root with ownership by the cPanel user and mode `700`.
- **Domain does not open:** verify DNS before changing application code. A hosting configuration cannot fix a domain with no A/AAAA/CNAME/nameserver record.
- **Admin unavailable:** verify `ADMIN_PASSWORD` and `SESSION_SECRET` are set in the Node application's environment, then restart.
