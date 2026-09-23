# Seguridad y rendimiento — LectoSmart

Qué se blindó dentro de la aplicación, qué falta hacer en el servidor y qué
hacer si algo se cae. Todo aplica al VPS Linode `45.79.184.87`, que **comparte
con el CRM de Coltek, n8n y evolution-api** — por eso casi todo lo de aquí está
acotado al bloque de LectoSmart: tocar la configuración global puede tumbar los
otros servicios.

---

## 1. Lo que ya quedó hecho en el código

| Riesgo | Antes | Ahora |
|--------|-------|-------|
| Fuerza bruta en los 3 logins | intentos ilimitados | 20 fallos por IP cada 10 min (los aciertos no gastan cupo) |
| Abuso de la IA (cuesta dinero) | ilimitado | 30 consultas / 5 min **por usuario**, no por IP |
| Spam de grabaciones de voz | ilimitado, 8 MB cada una | 10 cada 5 min por usuario |
| Inundar la API | sin límite | 600 req/min por IP |
| Sumar puntos con un script | sin límite | 120 respuestas/min por usuario |
| Cuerpos JSON enormes | **10 MB en toda la API** | 512 kB en general; 10 MB solo en `/verificar-audio` |
| Cabeceras de seguridad | ninguna | `helmet` (CSP, HSTS, nosniff, `frame-ancestors 'none'`) |
| Fuga de tecnología | `X-Powered-By: Express` | desactivado |
| Slowloris (conexiones colgadas) | sin tiempos límite | headers 30 s, petición 180 s, keep-alive 30 s |
| Arrancar sin `JWT_SECRET` | arrancaba igual | el proceso no inicia y lo dice claro |
| Dependencias vulnerables | 1 crítica + 2 altas | 0 (`bcrypt` 5 → 6; los hashes existentes siguen valendo) |

> **Por qué los límites de IA y de intentos van por usuario y no por IP:** todo
> el colegio sale a internet por una sola IP pública. Un límite bajo por IP
> bloquearía al curso entero a media clase. Por eso lo que se limita duro es lo
> que cuesta dinero, y se identifica con el id del JWT.

**Rendimiento:**

| | Antes | Ahora |
|---|-------|-------|
| Instalación del PWA (precache) | 2 733 KB | **888 KB** (−67 %) |
| JS inicial | 327 KB (89 KB gzip) | **228 KB** (73 KB gzip) |
| CSS | 31,4 KB | 18,2 KB |
| `logo.jpg` | 170,6 KB (1254 px) | **14,5 KB** (256 px) |
| Panel del docente | siempre descargado | 52 KB aparte, solo si entra un docente |
| Respuestas de la API | sin comprimir | gzip |
| `GET /docente/resumen` | leía la tabla `Intento` **completa** con el texto de cada actividad repetido | filtra por los estudiantes del docente, sin join, y parsea cada actividad una sola vez |

El original del logo quedó en `frontend/reference/logo-original.jpg` por si se
necesita en alta resolución.

---

## 2. Lo que ya quedó hecho en el VPS (12-ago-2026)

Aplicado y verificado en producción, todo acotado al bloque de LectoSmart:

- **nginx** (`/etc/nginx/sites-available/lectosmart`): cabeceras de seguridad en
  el snippet `snippets/lectosmart-seguridad.conf` (HSTS, CSP, nosniff,
  `frame-ancestors 'none'`, `Permissions-Policy` con `microphone=(self)` porque
  la fluidez graba voz), `client_max_body_size 16m`, gzip, caché de un año para
  `/assets/` (llevan hash) y `no-cache` para `index.html`, `sw.js` y
  `registerSW.js`.
- **Límite de tasa en nginx**: zonas en `/etc/nginx/conf.d/limite-lectosmart.conf`
  (30 r/s general, 10 r/m en `/api/auth/`). Definir la zona no afecta a nadie
  más; solo se aplica dentro del `server` de LectoSmart.
- **`server_tokens off`** en `nginx.conf` — ya no se anuncia la versión.
- **fail2ban**: cárcel `nginx-limit-req` añadida a la de `sshd` que ya existía
  (10 disparos en 10 min → 1 hora de bloqueo en el firewall).
- **Respaldos previos al despliegue** en `/root/backups/`
  (`lectosmart-predespliegue-*.sql.gz` y `lectosmart-archivos-*.tar.gz`), y la
  configuración de nginx anterior en `/root/backups/nginx/`.

Comprobado en producción: fuerza bruta cortada (401 y luego 429), cuerpo de
600 kB rechazado con 413, rutas de estudiante sin token en 401, y el CRM,
n8n, evolution-api y design.coltek.com.co siguen arriba.

## 3. Lo que falta en el VPS

### 3.1 Cloudflare delante del dominio (30 min, el de mayor impacto)

Es lo único de esta lista que para un ataque de denegación de servicio real,
porque el tráfico ni siquiera llega al VPS. Plan gratuito:

1. Añade `coltek.com.co` a Cloudflare y cambia los nameservers en el registrador.
2. Registro `A` de `lectosmart` → `45.79.184.87`, **nube naranja activada**
   (esto oculta la IP real del servidor).
3. SSL/TLS → modo **Full (strict)** (el certificado Let's Encrypt del VPS ya sirve).
4. Security → **Bot Fight Mode** activado.
5. Rules → Rate limiting: `lectosmart.coltek.com.co/api/auth/*` → 10 peticiones
   por minuto por IP.

> Ojo: al pasar el dominio por Cloudflare, **todos** los subdominios de
> `coltek.com.co` cambian de nameserver. Verifica antes que el CRM, el correo
> (registros MX/SPF/DKIM) y n8n queden con sus registros iguales, o se caen.

### 3.2 Firewall

**Este VPS no tiene `ufw`** (se desinstaló); el firewall lo lleva
`iptables-persistent`. Revisa lo que hay antes de tocar nada:

```bash
sudo iptables -L -n --line-numbers
```

Debe permitir solo 22 (SSH), 80 y 443. Si abres o cierras algo:

```bash
sudo netfilter-persistent save
```

> **Nunca** apliques una regla que cierre el 22 sin tener abierta una segunda
> sesión SSH funcionando. Si te quedas fuera, se entra por la consola web
> (LISH) de Linode.

### 3.3 Actualizaciones automáticas de seguridad

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 3.4 Que el servicio se levante solo

Verifica que `/etc/systemd/system/lectosmart.service` tenga:

```ini
Restart=always
RestartSec=5
```

Así, si el proceso muere, systemd lo revive en 5 segundos.

---

## 4. Contingencia: qué hacer si pasa algo

**El sitio no carga**

```bash
systemctl status lectosmart nginx        # ¿están vivos?
journalctl -u lectosmart -n 100 --no-pager   # últimos errores de la app
df -h                                    # ¿disco lleno? (causa nº1 silenciosa)
free -m                                  # ¿memoria agotada?
sudo systemctl restart lectosmart
```

**Sospecha de ataque / tráfico raro**

```bash
# IPs con más peticiones en el log de hoy
sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# Bloquear una IP concreta ya mismo
sudo iptables -I INPUT -s IP_ATACANTE -j DROP && sudo netfilter-persistent save
```

Si viene de muchas IPs a la vez, no pelees con iptables: activa el modo
**"I'm Under Attack"** de Cloudflare (por eso vale la pena tenerlo puesto antes).

**Restaurar la base de datos** (el respaldo corre a diario a las 2:10 a. m.):

```bash
ls -lh /root/backups/                       # conserva 14 días
gunzip -c /root/backups/lectosmart-FECHA.sql.gz | mysql -u lectosmart -p lectosmart
sudo systemctl restart lectosmart
```

> **Prueba la restauración una vez**, en una base de datos de prueba. Un
> respaldo que nunca se restauró no es un respaldo, es una suposición.

**Si crees que entraron al servidor:** no borres nada todavía (los logs son la
evidencia). Cambia las contraseñas de la base de datos y el `JWT_SECRET` del
`.env` — rotar el secreto invalida todas las sesiones abiertas —, revisa
`last -20` y `sudo grep -i "accepted" /var/log/auth.log | tail -30` para ver
qué sesiones SSH entraron, y recién ahí reinstala lo que haga falta.

---

## 5. Despliegue

```bash
# 1. En local
cd frontend && npm run build

# 2. Subir backend (sin node_modules/.env/dev.db/migrations) y frontend/dist

# 3. En el VPS, dentro de /opt/lectosmart/backend
npm install --omit=dev
npx prisma db push --schema prisma/schema.mysql.prisma
npm run seed          # necesario tras esta versión: siembra las 48 actividades de ortografía
sudo systemctl restart lectosmart
```

El `seed` usa `upsert`: se puede correr las veces que sea sin duplicar nada ni
borrar el progreso de los estudiantes.

**Antes del primer despliegue de esta versión, revisa el `.env` de producción:**

- `JWT_SECRET` — largo y aleatorio (la app ya no arranca sin él). Si lo cambias,
  todos tienen que volver a iniciar sesión.
- `FRONTEND_URL=https://lectosmart.coltek.com.co` — sin esto, la API acepta
  peticiones desde cualquier origen.
- `ADMIN_USUARIO` / `ADMIN_PASSWORD` — deben coincidir con la cuenta real, o el
  siguiente `seed` crea un administrador **adicional** con la contraseña por
  defecto (ver CLAUDE.md).

---

## 6. Comprobación después de desplegar

- <https://securityheaders.com/?q=lectosmart.coltek.com.co> — debería dar A o A+
- <https://www.ssllabs.com/ssltest/> — el certificado y los protocolos TLS
- <https://pagespeed.web.dev/> — rendimiento real en móvil
- Entrar como estudiante y como docente y revisar que todo cargue
