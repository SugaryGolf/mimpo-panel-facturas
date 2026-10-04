# MIMPO · Panel de Facturas y Equipos (Global Logistics)

Sistema web profesional para la gestión, procesamiento y análisis de facturas XML, desarrollado con **React**, **Flask (Python)** y **SQL Server**. Cuenta con una interfaz moderna con selector de modo oscuro/claro, navegación modular, filtros avanzados, gráficas dinámicas y resumen financiero anual.

---

## 🚀 Tecnologías Utilizadas

- **Frontend:** React, Vite, Recharts, Axios, CSS Modular.
- **Backend:** Python, Flask, Flask-CORS, Pandas, Openpyxl, pyodbc.
- **Base de Datos:** Microsoft SQL Server.

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalado en tu computadora:
- [Python](https://www.python.org/) (versión 3.8 o superior)
- [Node.js y npm](https://nodejs.org/)
- [Microsoft SQL Server](https://www.microsoft.com/es-es/sql-server/sql-server-downloads)

---

## 📥 Instrucciones de Instalación y Ejecución

Sigue estos pasos en orden para poner en marcha el sistema localmente:

### 1. Configuración de la Base de Datos (SQL Server)
1. Abre tu gestor de SQL Server (SSMS).
2. Crea una base de datos con el nombre:
   ```sql
   CREATE DATABASE PanelFacturas;
