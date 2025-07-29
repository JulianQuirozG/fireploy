
# Licencia y acuerdos
Este proyecto y sus componentes se encuentran licenciados bajo la Licencia MIT, lo que significa que cualquier persona puede utilizar, copiar, modificar y distribuir el software con fines personales, académicos o comerciales, siempre que se mantenga el aviso original de derechos de autor. Esta licencia es muy permisiva y favorece la adopción abierta, pero también indica que el software se proporciona "tal cual", sin garantías de ningún tipo, por lo que el autor no se hace responsable de su uso.

Este repositorio contiene el backend del proyecto **Fireploy**, un sistema que gestiona despliegues automatizados usando colas de trabajo, contenedores, y una base de datos MySQL. El backend está dividido en tres entornos principales:

- **Backend principal**
- **Worker**
- **Base de datos**

---

# 🔥 Fireploy Backend


## ⚙️ Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu servidor:

- Ubuntu 20.04/22.04
- Node.js >= 18.x
- PM2
- Docker
- Git
- Nginx
- Certbot (para HTTPS)
- Redis (contenedor)
- MySQL

---

## 🌐 Configuración de Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

Crear archivo de configuración:

```bash
sudo nano /etc/nginx/sites-available/fireploy
```

Contenido del archivo:

```nginx
server {
    listen 80 default_server;
    server_name fireploy.online;

    location / {
        proxy_pass http://localhost:4173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Activar la configuración:

```bash
sudo ln -s /etc/nginx/sites-available/fireploy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx
```

---

## 🔐 Certificado SSL con Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.fireploy.online
```

---

## 🧠 Base de Datos (MySQL)

### 🔧 Instalación y configuración

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### ⚙️ Configuración del usuario y base de datos

```sql
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'TU_CONTRASEÑA';
CREATE USER 'fireploy'@'%' IDENTIFIED BY 'Fireploy4769!';
GRANT ALL PRIVILEGES ON *.* TO 'fireploy'@'%' WITH GRANT OPTION;
CREATE DATABASE fireploy;
FLUSH PRIVILEGES;
EXIT;
```

Habilitar acceso externo:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Cambiar bind-address = 127.0.0.1 por 0.0.0.0
sudo systemctl restart mysql
```

---

## ⚙️ Configuración del Worker

### 🖥 Crear usuario

```bash
sudo adduser fireploy_worker
sudo usermod -aG sudo fireploy_worker
su fireploy_worker
```

### 🛠 Instalación de dependencias

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nodejs npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 🐳 Docker

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
sudo apt install docker-ce
sudo usermod -aG docker fireploy_worker
su - fireploy_worker
```

### 🚀 Despliegue del Worker

```bash
git clone https://github.com/JulianQuirozG/Fireploy_Worker
# Copiar el archivo .env al directorio raíz del proyecto
cd Fireploy_Worker
sudo npm install
sudo npm run build
pm2 start dist/main.js --name fireploy_worker
pm2 save
pm2 startup
pm2 list
```

---

## 🧰 Configuración del Backend

### 🖥 Crear usuario

```bash
sudo adduser fireploy_backend
sudo usermod -aG sudo fireploy_backend
su fireploy_backend
```

### 🛠 Instalación

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nodejs npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 🐳 Docker

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
sudo apt install docker-ce
sudo usermod -aG docker fireploy_backend
su - fireploy_backend
```

### 🛠 Redis (en contenedor)

```bash
docker run -d --name redis-bull -p 6380:6379 redis
```

### 🚀 Despliegue del Backend

```bash
git clone https://github.com/JulianQuirozG/fireploy.git
# Copiar el archivo .env al directorio raíz del proyecto
cd fireploy
sudo npm install
sudo npm run build
pm2 start dist/main.js --name fireploy_backend
pm2 save
pm2 startup
pm2 list
```

---

## 🌐 Configuración de Red

Asegúrate de abrir los siguientes puertos en tu firewall o proveedor de nube:

| Puerto | Protocolo | Descripción       |
|--------|-----------|-------------------|
| 80     | HTTP      | Tráfico web       |
| 443    | HTTPS     | Tráfico seguro    |
| 3306   | TCP       | MySQL             |
| 6380   | TCP       | Redis (opcional)  |

---

## 🧪 Verificación Final

- ✅ Nginx redirecciona correctamente a tu aplicación
- ✅ Certificado SSL emitido por Let's Encrypt
- ✅ Worker y backend ejecutándose con PM2
- ✅ Base de datos accesible externamente (segura y restringida)
- ✅ Redis en contenedor operativo

