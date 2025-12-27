# Frontend-Backend Integration Guide

## Setup Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and set your backend URL:
   ```
   VITE_API_URL=http://localhost:3000
   ```

   For production, use your production backend URL:
   ```
   VITE_API_URL=https://your-backend-domain.com
   ```

## Authentication

The frontend now uses JWT authentication:

1. **Login Page**: `/login` - Users must login before accessing the app
2. **Protected Routes**: All pages except login require authentication
3. **Token Storage**: JWT token is stored in `localStorage` as `auth_token`
4. **Auto Logout**: If token expires or is invalid, user is redirected to login

### Default Admin Credentials

After running the backend setup script (`npm run create-admin`), you can login with:
- **Username**: `admin`
- **Password**: `admin123`

## API Integration

All data operations now use the backend API:

### Updated Pages

1. **DataTerapisPage** - Uses `terapisAPI`
2. **DataRequirementPage** - Uses `requirementAPI`
3. **FormTNAPage** - Uses `tnaAPI` (to be updated)
4. **FormEvaluasiPage** - Uses `evaluasiAPI` (to be updated)
5. **DataTrainingPage** - Uses `trainingAPI` (to be updated)

### API Service

All API calls are centralized in `src/services/api.ts`:
- `authAPI` - Authentication endpoints
- `terapisAPI` - Therapist data endpoints
- `requirementAPI` - Requirement data endpoints
- `tnaAPI` - TNA form endpoints
- `evaluasiAPI` - Evaluation form endpoints
- `trainingAPI` - Training module endpoints
- `rolesAPI` - Role management (admin only)
- `usersAPI` - User management (admin only)
- `auditAPI` - Audit log endpoints (admin only)

## Running the Application

1. **Start Backend** (in `backend/` directory):
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run create-admin
   npm start
   ```

2. **Start Frontend** (in root directory):
   ```bash
   npm install
   npm run dev
   ```

3. **Access the app**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`
   - Login at: `http://localhost:5173/#/login`

## Data Flow

1. User logs in → Token stored in localStorage
2. All API requests include token in `Authorization: Bearer <token>` header
3. Backend validates token and returns data
4. Frontend displays data from API responses
5. All CRUD operations are logged in audit_logs table

## Error Handling

- Network errors are caught and displayed to users
- 401 Unauthorized errors automatically redirect to login
- All errors are logged to console for debugging

## Next Steps

- [ ] Update FormTNAPage to use API
- [ ] Update FormEvaluasiPage to use API
- [ ] Update DataTrainingPage to use API
- [ ] Add loading states to all pages
- [ ] Add error boundaries
- [ ] Implement refresh token mechanism

