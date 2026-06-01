# DineOS — Shared PostgreSQL Database Setup Guide

This guide provides step-by-step instructions for sharing your local PostgreSQL database with your team members (e.g., for co-developing the Admin Portal and Customer/Delivery Mobile Apps). 

Since the DineOS transactional system uses PostgreSQL mapped via `firebase_uid` and tracks geofencing details using **PostGIS**, both frontend applications must connect to a shared data source to synchronize status updates, orders, and branch metrics in real time.

---

## Option 1: Share a Local Database Over the Same Office Network (LAN)

If you and your team members are working in the same physical office and connected to the **same Wi-Fi or Local Area Network (LAN)**, you can host PostgreSQL on your computer (the **Host Machine**) and let other computers (the **Client Machines**) connect to it directly.

### Step 1: Find Your Local IP Address
On the **Host Machine** (your computer hosting the PostgreSQL database):
1. Open **PowerShell** or **Command Prompt**.
2. Run the following command:
   ```powershell
   ipconfig
   ```
3. Locate your active network adapter (e.g., *Wireless LAN adapter Wi-Fi* or *Ethernet adapter*).
4. Note your **IPv4 Address** (typically looks like `192.168.1.XX` or `10.0.0.XX`).
   > **Note:** Write this down as `YOUR_LOCAL_IP`.

---

### Step 2: Configure PostgreSQL to Accept Network Connections
By default, PostgreSQL only listens for connections coming from `localhost` (your own computer). You must configure it to listen to other devices on the network.

1. Open your file explorer and navigate to your PostgreSQL **data** directory. By default, on Windows, it is located at:
   `C:\Program Files\PostgreSQL\<VERSION>\data\`
2. Open the file `postgresql.conf` using a text editor (e.g., Notepad run as Administrator).
3. Find the following line (use `Ctrl + F` to search):
   ```text
   #listen_addresses = 'localhost'
   ```
4. Uncomment the line by removing the `#` and change the value to `'*'` to listen to all network interfaces:
   ```text
   listen_addresses = '*'
   ```
5. Save and close the file.

---

### Step 3: Authorize Client Access in `pg_hba.conf`
You must explicitly authorize devices on your local network to log in to your database.

1. In the same `data` directory, open `pg_hba.conf` using a text editor.
2. Scroll to the bottom of the file where the IP address connection rules are defined.
3. Add a new line at the very end to allow all computers within your local subnet to connect:
   ```text
   # Allow local network connections
   host    all             all             192.168.0.0/16          scram-sha-256
   ```
   *If your office router uses `10.X.X.X` network subnetting instead of `192.168.X.X`, use this line instead:*
   ```text
   host    all             all             10.0.0.0/8              scram-sha-256
   ```
4. Save and close the file.

---

### Step 4: Restart the PostgreSQL Service
For the configuration changes to take effect, you must restart the PostgreSQL service.

1. Press `Win + R`, type `services.msc`, and press **Enter**.
2. Scroll down to find the service named **`postgresql-x64-<VERSION>`** (e.g., `postgresql-x64-16`).
3. Right-click on it and select **Restart**.

---

### Step 5: Configure Windows Firewall
Windows Defender Firewall blocks incoming connections to PostgreSQL (Port `5432`) by default. You must create an inbound rule to allow your team member's connections through.

1. Press the `Start` key, search for **Windows Defender Firewall with Advanced Security**, and open it.
2. In the left panel, click on **Inbound Rules**.
3. In the right panel under *Actions*, click **New Rule...**
4. Select **Port** and click **Next**.
5. Select **TCP** and in **Specific local ports**, enter `5432`. Click **Next**.
6. Select **Allow the connection** and click **Next**.
7. Keep **Domain**, **Private**, and **Public** checked (or just *Private* if you are strictly on a trusted office network), then click **Next**.
8. Name the rule `PostgreSQL Shared Access` and click **Finish**.

> [!TIP]
> **Alternative Quick Setup (PowerShell):**
> You can create the firewall rule instantly by opening **PowerShell as Administrator** and running:
> ```powershell
> New-NetFirewallRule -DisplayName "PostgreSQL Shared Access" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow
> ```

---

### Step 6: Connect from the Client Machine
Your colleague can now connect to your database. 

Use the following configuration details on their machine (replace items in brackets):
* **Host / IP**: `YOUR_LOCAL_IP` (e.g., `192.168.1.50`)
* **Port**: `5432`
* **Username**: Your database username (default: `postgres`)
* **Password**: Your database password
* **Database Name**: `roms_db` (or your database name)

**Connection URL String:**
```text
postgresql://[username]:[password]@[YOUR_LOCAL_IP]:5432/roms_db
```

---
---

## Option 2: Share a Local Database Remotely (Ngrok or Tailscale)

If you and your team member are **not in the same office** (e.g., working from home or different locations) but you still want to host the database on your local computer, you can expose your database port securely over the internet.

### Method A: Using Ngrok (Quickest Public URL Tunnel)
Ngrok creates a secure public TCP tunnel directly to your local port `5432`.

1. Go to [ngrok.com](https://ngrok.com/) and sign up for a free account.
2. Download and install Ngrok on your **Host Machine**.
3. Retrieve your **Authtoken** from your Ngrok dashboard and register it in your command line:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```
4. Start a TCP tunnel on the PostgreSQL port:
   ```bash
   ngrok tcp 5432
   ```
5. Ngrok will open a terminal window showing active forwarding info:
   ```text
   Forwarding   tcp://0.tcp.ngrok.io:12345 -> localhost:5432
   ```
6. **To Connect**: Your office mate will use the forwarding address provided by Ngrok:
   * **Host**: `0.tcp.ngrok.io`
   * **Port**: `12345` (this dynamic port changes each time you restart Ngrok)
   * **Connection String**:
     ```text
     postgresql://[username]:[password]@0.tcp.ngrok.io:12345/roms_db
     ```

---

### Method B: Using Tailscale (Recommended for Secure & Permanent Shared VPN)
Tailscale sets up a zero-config, encrypted private network (VPN Mesh) between your devices. It is completely secure, free for small teams, and does not expose your database to the public internet.

1. Sign up for a free account at [tailscale.com](https://tailscale.com/).
2. Download and install the Tailscale app on **both** your host computer and your colleague’s computer.
3. Log in to the same Tailscale account (or create a shared "tailnet") on both machines.
4. **Find your Tailscale IP**: Once connected, Tailscale will assign a static private IP address to your computer (e.g., `100.80.XX.XX` — you can copy it directly from the Tailscale app UI or dashboard).
5. **Configure PostgreSQL for Tailscale IP**:
   * Open `pg_hba.conf` in your local Postgres data directory.
   * Add a line at the bottom to allow your colleague's Tailscale connection:
     ```text
     # Allow Tailscale network connections
     host    all             all             100.64.0.0/10           scram-sha-256
     ```
   * Restart the PostgreSQL service.
6. **To Connect**: Your colleague can connect directly using your **Tailscale IP address**:
   * **Host**: `YOUR_TAILSCALE_IP` (e.g., `100.80.12.34`)
   * **Port**: `5432`
   * **Connection String**:
     ```text
     postgresql://[username]:[password]@[YOUR_TAILSCALE_IP]:5432/roms_db
     ```
   > **Note:** Tailscale IP addresses are static, meaning your colleague's connection settings will work permanently without needing to update ports or host strings when you restart your computer!
