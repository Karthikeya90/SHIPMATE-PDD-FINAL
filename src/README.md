


# SHIPMATE - Peer-to-Peer Delivery Marketplace

SHIPMATE is a premium full-stack web application prototype that connects people who want to send items with nearby travellers who can deliver those items and earn money.

## Architecture & Scope

This project is a **high-fidelity frontend prototype** built with React, TypeScript, Tailwind CSS, and Framer Motion. 

**Important Note:** The backend (Node/Express), database (MySQL/PostgreSQL), and real-time servers (WebSocket) are **mocked** in this prototype to allow for immediate interaction and testing of the UI/UX flows without requiring a complex backend setup.

### Key Technologies
- **Frontend:** React 18, React Router v6
- **Styling:** Tailwind CSS, Framer Motion (animations)
- **Icons & UI:** Lucide React, Sonner (toasts), Recharts (charts)
- **Maps:** Leaflet & React-Leaflet
- **Mock Data Layer:** Typed TypeScript interfaces simulating a relational database schema.
- **Service Layer:** Promise-based services (`authService`, `deliveryService`, `chatService`) that simulate network latency and return mock data.

## Folder Structure

- `/components`: Reusable UI components (e.g., `ProtectedRoute`).
- `/context`: React Context providers (e.g., `AuthContext` for managing mock JWT sessions).
- `/data`: TypeScript interfaces (`types.ts`) and mock database records (`mockData.ts`).
- `/layouts`: Structural layouts for different roles (`PublicLayout`, `DashboardLayout`).
- `/pages`: Page-level components organized by role (`/sender`, `/traveller`, and common pages).
- `/services`: API simulation layer.

## How to Swap for a Real Backend

To convert this prototype into a fully functional full-stack application:

1. **Database:** Implement the schema defined in `data/types.ts` in your preferred SQL database (PostgreSQL/MySQL).
2. **API:** Create REST endpoints (e.g., Node/Express) that match the signatures in the `services/` folder.
3. **Authentication:** Replace `authService.ts` with real API calls to your JWT authentication endpoints. Update `AuthContext` to handle real tokens securely.
4. **Real-time Chat:** Replace `chatService.ts` with a WebSocket client (e.g., Socket.io) to handle real-time messaging instead of the simulated interval-based replies.
5. **Maps:** The current map uses static coordinates for demonstration. Integrate Google Maps API or Mapbox for real geocoding and routing.

## Demo Accounts

You can log in using the following mock credentials (any password works):
- **Sender:** `alex@example.com`
- **Traveller:** `sarah@example.com`


