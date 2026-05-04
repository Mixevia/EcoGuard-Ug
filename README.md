# EcoGuard-Ug 

**Uganda's Environmental Monitoring & Plastic Waste Management Platform**

EcoGuard-Ug is an open-source web application that gives Ugandan communities, researchers, and policymakers real-time visibility into plastic waste generation patterns and air quality across Uganda's major cities. Built with a Uganda-first data model, the platform surfaces actionable intelligence on waste hotspots, collection rates, and recycling infrastructure — helping bridge the gap between environmental data and ground-level action.

---

## The Problem

Uganda generates over **1,100 tonnes of plastic waste daily**, yet formal collection covers less than 50% of urban areas and recycling rates hover in the single digits. The absence of a centralised, publicly accessible environmental monitoring platform means that communities, NGOs, and government agencies are making decisions without real data. EcoGuard-Ug addresses this directly.

---

## Features

| Feature | Description |
|---|---|
| **Interactive Uganda Map** | City-by-city waste data with drill-down views for waste generation, collection rates, and recycling facilities |
| **Air Quality Monitoring** | Real-time air quality index (AQI) per city with PM2.5 and ozone readings |
| **Environmental Alerts** | Automated severity-rated alerts when environmental thresholds are breached |
| **Waste Management Analysis** | AI-assisted analysis covering impact assessment, solution recommendations, and trend analysis |
| **Community Reporting** | Allows citizens to report waste incidents directly from the platform |
| **Learn Section** | Educational content on bioplastics, waste reduction, and sustainable alternatives |
| **Dark Mode** | Full dark/light mode support for accessibility |

---

## Cities Covered

| City | Region | Daily Waste | Collection Rate |
|---|---|---|---|
| Kampala | Central | 850 tons | 65% |
| Gulu | Northern | 68 tons | 35% |
| Mbarara | Western | 45 tons | 50% |
| Jinja | Eastern | 42 tons | 55% |
| Lira | Northern | 52 tons | 40% |

---

## Tech Stack

**Frontend**
- React 19
- Tailwind CSS 3
- Axios (HTTP client)
- React Router DOM 7

**Backend**
- FastAPI (Python)
- MongoDB + Motor (async driver)
- httpx (async HTTP)
- Pydantic v2

**Data Sources**
- OpenAQ — African air quality readings (free, no key required)
- Uganda Bureau of Statistics (2024) — population and waste estimates
- National Environment Management Authority (NEMA) — regulatory data
- World Bank What a Waste 2.0 — waste benchmarks
- UN Environment Programme — plastic pollution data

---

## Project Structure

```
EcoGuard-Ug/
├── backend/
│   ├── server.py          # FastAPI application — all routes and business logic
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React application
│   │   ├── App.css        # Global styles
│   │   └── index.js       # Entry point
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example       # Frontend environment variable template
├── tests/
│   └── __init__.py
├── backend_test.py        # API integration tests
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas free tier)

### 1. Clone the repository

```bash
git clone https://github.com/Mixevia/EcoGuard-Ug.git
cd EcoGuard-Ug
```

### 2. Set up the backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your environment file
cp .env.example .env
# Edit .env and fill in your values (see Environment Variables below)

# Start the API server
uvicorn server:app --reload --port 8000
```

The API will be available at `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### 3. Set up the frontend

```bash
cd frontend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Set REACT_APP_BACKEND_URL=http://localhost:8000

# Start the development server
npm start
```

The app will open at `http://localhost:3000`

---

## Environment Variables

**Backend — `backend/.env`**

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=ecoguard_ug
```

**Frontend — `frontend/.env`**

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

> **Never commit `.env` files to version control.** Both `.env` files are listed in `.gitignore`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/` | Health check |
| `GET` | `/api/locations` | List all monitoring locations |
| `POST` | `/api/initialize-uganda-locations` | Seed default Uganda city data |
| `DELETE` | `/api/locations/{id}` | Remove a location |
| `GET` | `/api/air-quality/{location_id}` | Air quality data for a location |
| `GET` | `/api/alerts` | List all environmental alerts |
| `PATCH` | `/api/alerts/{id}/acknowledge` | Acknowledge an alert |
| `GET` | `/api/waste-management/solutions` | Waste management solution library |
| `POST` | `/api/waste-management/analysis` | Run a waste analysis |
| `GET` | `/api/waste-management/analysis` | List past analyses |
| `GET` | `/api/dashboard/summary` | Aggregated dashboard summary |

---

## Running Tests

```bash
# From the project root — make sure your backend server is running first
python backend_test.py
```

The test suite covers all API endpoints: location management, air quality data, alerts, and the dashboard summary.

---

## Environmental Impact

EcoGuard-Ug targets three UN Sustainable Development Goals:

- **SDG 11** — Sustainable Cities and Communities
- **SDG 12** — Responsible Consumption and Production
- **SDG 13** — Climate Action

---

## Contributing

Contributions are welcome, especially data corrections, new city additions, and UI improvements.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push and open a Pull Request

Please open an issue first for major changes so we can discuss the approach.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Author

**Mixevia**  
Built for the National Science Competition (NSC), Uganda  
Contact: open an issue on this repository
